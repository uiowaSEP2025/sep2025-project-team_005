import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DiscoverProfile from "@/app/[username]/page";
import { AuthProvider } from "@/context/ProfileContext";
import fetchMock from "jest-fetch-mock";
import React from "react";

fetchMock.enableMocks();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
    useParams: () => ({
        username: "johndoe",
    }),
}));

describe("Discover Profile Page", () => {
    let consoleErrorSpy: any;

    const musicianProfile = {
        stage_name: "John Doe",
        years_played: 5,
        home_studio: true,
        genres: ["Rock", "Pop"],
        instruments: [
          { instrument_name: "Guitar", years_played: 3 },
          { instrument_name: "Drums", years_played: 2 },
        ],
    };

    const followCount = {
        follower_count: 100,
        following_count: 50,
    }

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponses(
            [JSON.stringify({ user_id: "123" }), { status: 200 }],
            [JSON.stringify(musicianProfile), { status: 200 }],
            [JSON.stringify(followCount), { status: 200 }]
        );
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementationOnce(() => {});
    });

    const renderProfile = () => {
        render(
            <AuthProvider>
                <DiscoverProfile />
            </AuthProvider>
        );
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders user profile correctly", async () => {
        renderProfile();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

        expect(screen.getByText("John Doe")).toBeInTheDocument();

        expect(screen.getByText("Home Studio:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();

        expect(screen.getByText("Genres:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("Rock, Pop")).toBeInTheDocument();

        expect(screen.getByText("Instruments:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText(/Guitar - 3 years/)).toBeInTheDocument();
        expect(screen.getByText(/Drums - 2 years/)).toBeInTheDocument();
    });

    it("toggles dropdown menu", async () => {
        renderProfile();;

        const dropdownButton = await screen.findByTestId("dropdown-button");
        
        expect(dropdownButton).toBeInTheDocument();

        fireEvent.click(dropdownButton);

        expect(screen.getByText("Block User")).toBeInTheDocument();

        fireEvent.click(dropdownButton);
        expect(screen.queryByText("Block User")).not.toBeInTheDocument();
    });

    it("shows loading state when data is still loading", async () => {
        renderProfile();

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
    
    it("handles error in fetching user id from username", async () => {
        fetchMock.resetMocks();
        fetchMock.mockReject(new Error("Failed to fetch"));
    
        renderProfile();
        
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching user ID:", expect.any(Error));
        });
        consoleErrorSpy.mockRestore();
    });

    
    it("logs error on failed response for user id", async () => {
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });

        renderProfile();

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch user ID", "Internal Server Error");
        });
    });


    it("shows appropriate buttons when viewing own profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
        expect(screen.getByTestId("post-button")).toBeInTheDocument();
    });
    
    it("does not show inappropriate buttons when viewing someone else's profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    
        expect(screen.queryByTestId("edit-button")).toBeNull();
        expect(screen.queryByTestId("post-button")).toBeNull();
    }); 

    it("handles error fetching musician profile", async () => {
        fetchMock.resetMocks();
        fetchMock.mockResponses(
            [JSON.stringify({ user_id: "123" }), { status: 200 }],
            [JSON.stringify({}), { status: 500 }],
            [JSON.stringify({ follower_count: 100, following_count: 50 }), { status: 200 }]
        );
        
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    
        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch musician profile", "Internal Server Error");
    
        consoleErrorSpy.mockRestore();
    });    

    it("shows dropdown options for profile owner", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    
        // Simulate click on the dropdown button to open it
        const dropdownButton = screen.getByTestId("dropdown-button");
        fireEvent.click(dropdownButton);
    
        // Check if 'Block User' is not present in dropdown
        expect(screen.queryByText("Block User")).not.toBeInTheDocument();
    
        // Ensure 'Settings' and 'Logout' are present as a profile owner
        expect(screen.queryByText("Settings")).toBeInTheDocument();
        expect(screen.queryByText("Logout")).toBeInTheDocument();
    }); 
    
    it("shows different dropdown options based on profile ownership", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    
        // Simulate click on the dropdown button to open it
        const dropdownButton = screen.getByTestId("dropdown-button");
        fireEvent.click(dropdownButton);
    
        // Check if 'Block User' is present after the dropdown is opened
        expect(screen.queryByText("Block User")).toBeInTheDocument();
    
        // Ensure 'Settings' and 'Logout' are not present in an alternative user profile
        expect(screen.queryByText("Settings")).not.toBeInTheDocument();
        expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });

    it("shows appropriate buttons when visiting other profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

        expect(screen.getByTestId("message-button")).toBeInTheDocument();
        expect(screen.getByTestId("follow-button")).toBeInTheDocument();        
    });

    it("does not show inappropriate buttons when visiting own profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

        expect(screen.queryByTestId("message-button")).toBeNull();
        expect(screen.queryByTestId("follow-button")).toBeNull();
    });
});