import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DiscoverProfile from "@/app/[username]/page";
import { AuthProvider } from "@/context/ProfileContext";
import { ThemeProvider } from "@/context/ThemeContext";
import fetchMock from "jest-fetch-mock";

import React from "react";
import axios from "axios";
import Cookies from "js-cookie";


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
            [JSON.stringify(followCount), { status: 200 }],
            [JSON.stringify({}), { status: 500 }],
            [JSON.stringify({ follower_count: 100, following_count: 50 }), { status: 200 }]
        );
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementationOnce(() => {});
    });

    const renderProfile = () => {
        render(
            <ThemeProvider>
                <AuthProvider>
                    <DiscoverProfile />
                </AuthProvider>
            </ThemeProvider>
        );
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders user profile correctly", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            isLoading: false,
        });

        renderProfile();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

        expect(screen.getByText("John Doe")).toBeInTheDocument();

        expect(screen.getByText("Home Studio:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();

        expect(screen.getByText("Genres:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("Rock, Pop")).toBeInTheDocument();

        expect(screen.getByText("Instruments:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText(/Guitar - 3 years/)).toBeInTheDocument();
        expect(screen.getByText(/Drums - 2 years/)).toBeInTheDocument();
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
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
        expect(screen.getByTestId("post-button")).toBeInTheDocument();
    });
    
    it("does not show inappropriate buttons when viewing someone else's profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    
        expect(screen.queryByTestId("edit-button")).toBeNull();
        expect(screen.queryByTestId("post-button")).toBeNull();
    }); 

    it("handles error fetching follow count", async () => {
        fetchMock.resetMocks();
        fetchMock.mockResponses(
            [JSON.stringify({ user_id: "123" }), { status: 200 }],
            [JSON.stringify({}), { status: 500 }],
            [JSON.stringify({ follower_count: 100, following_count: 50 }), { status: 200 }]
        );
        
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    
        expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to fetch follow count", "Internal Server Error");
    
        consoleErrorSpy.mockRestore();
    });    

    it("shows dropdown options for profile owner", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    
        // Simulate click on the dropdown button to open it
        const dropdownButton = screen.getByTestId("dropdown-button");
        fireEvent.click(dropdownButton);
    
        // Check if 'Block User' is not present in dropdown
        expect(screen.queryByText("Block User")).not.toBeInTheDocument();
    
        // Ensure 'Settings' and 'Logout' are present as a profile owner
        expect(screen.queryByTestId("menu-item-settings")).toBeInTheDocument();
        expect(screen.queryByText("Logout")).toBeInTheDocument();
    }); 
    
    it("shows different dropdown options on alternate profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    
        // Simulate click on the dropdown button to open it
        const dropdownButton = screen.getByTestId("dropdown-button");
        fireEvent.click(dropdownButton);
    
        // Check if 'Block User' is present after the dropdown is opened
        expect(screen.queryByText("Block User")).toBeInTheDocument();
    
        // Ensure 'Settings' and 'Logout' are not present in an alternative user profile
        expect(screen.queryByTestId("menu-item-settings")).not.toBeInTheDocument();
        expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });

    /*it("shows appropriate buttons when visiting other profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

        expect(screen.getByTestId("message-button")).toBeInTheDocument();
        expect(screen.getByTestId("follow-button")).toBeInTheDocument();        
    });*/

    it("does not show inappropriate buttons when visiting own profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

        expect(screen.queryByTestId("message-button")).toBeNull();
        expect(screen.queryByTestId("follow-button")).toBeNull();
    });  

    it("shows dropdown options for profile owner", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    
        // Simulate click on the dropdown button to open it
        const dropdownButton = screen.getByTestId("dropdown-button");
        fireEvent.click(dropdownButton);
    
        // Ensure 'Settings' and 'Logout' are present for profile owner
        expect(screen.queryByTestId("menu-item-settings")).toBeInTheDocument();
        expect(screen.queryByText("Logout")).toBeInTheDocument();
    });
    
    it("shows different dropdown options on alternate profile", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    
        // Simulate click on the dropdown button to open it
        const dropdownButton = screen.getByTestId("dropdown-button");
        fireEvent.click(dropdownButton);
    
        // Ensure 'Block User' is present in dropdown for alternate profile
        expect(screen.queryByText("Block User")).toBeInTheDocument();
    
        // Ensure 'Settings' and 'Logout' are not present for alternate profile
        expect(screen.queryByTestId("menu-item-settings")).not.toBeInTheDocument();
        expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });
    
    it("blocks user successfully", async () => {
        const alertMock = jest.fn();
        global.alert = alertMock;
    
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "janedoe" },
            isLoading: false,
        });
    
        renderProfile();
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
    
        // Simulate click on the dropdown button to open it
        const dropdownButton = screen.getByTestId("dropdown-button");
        fireEvent.click(dropdownButton);
    
        await waitFor(() => {
            expect(screen.getByTestId("menu-item-block-user")).toBeInTheDocument();
        });
    
        const blockButton = screen.getByTestId("menu-item-block-user");
        fireEvent.click(blockButton);
    
        // Wait for the alert
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith("User blocked.");
        });
    });

    it("calls handleNavigation with correct arguments when clicking follower or following button", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            isLoading: false,
        });

        const followCount = { follower_count: 100, following_count: 50 };
        const userId = { user_id: "123" };

        renderProfile();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

        const followerButton = screen.getByText("100");
        fireEvent.click(followerButton);

        expect(screen.getByText("Followers")).toBeInTheDocument();

        const followingButton = screen.getByText("50");
        fireEvent.click(followingButton);

        expect(screen.getByText("Following")).toBeInTheDocument();
    });

    it("renders follower and following count correctly", async () => {
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            isLoading: false,
        });

        const followCount = { follower_count: 100, following_count: 50 };
        const userId = { user_id: "123" };

        renderProfile();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

        expect(screen.getByText("100")).toBeInTheDocument(); // Follower count
        expect(screen.getByText("50")).toBeInTheDocument(); // Following count
    });

    it("logout user successfully", async () => {
        // Mock the context hook
        const setProfileMock = jest.fn();
        jest.spyOn(require("@/context/ProfileContext"), "useAuth").mockReturnValue({
            profile: { username: "johndoe" },
            setProfile: setProfileMock,
            isLoading: false,
        });

        jest.spyOn(axios, "post").mockResolvedValue({ status: 200 });
        jest.spyOn(Cookies, "remove").mockImplementation(() => {});

        // Mock the useRouter push function
        const pushMock = jest.fn();
        jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
            push: pushMock,
        });

        renderProfile();

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));

        // Simulate click on the dropdown button to open it
        const dropdownButton = screen.getByTestId("dropdown-button");
        fireEvent.click(dropdownButton);

        // Wait for logout button to appear
        await waitFor(() => {
            expect(screen.getByTestId("menu-item-logout")).toBeInTheDocument();
        });

        // Simulate logout button click
        const logoutButton = screen.getByTestId("menu-item-logout");
        fireEvent.click(logoutButton);

        await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:8000/api/auth/logout/", 
            { credentials: "include" }
        ));

        expect(Cookies.remove).toHaveBeenCalledWith("access_token");
        expect(setProfileMock).toHaveBeenCalledWith(null);
        expect(pushMock).toHaveBeenCalledWith("/login");
    });
});