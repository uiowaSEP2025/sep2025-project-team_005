import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DiscoverProfile from "@/app/profile/discoverprofile/[username]/page";
import { AuthProvider } from "@/context/ProfileContext";
import fetchMock from "jest-fetch-mock";

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
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponses(
            [JSON.stringify({ user_id: "123" }), { status: 200 }], // User ID fetch
            [JSON.stringify({
                stage_name: "John Doe",
                years_played: 5,
                home_studio: true,
                genres: ["Rock", "Pop"],
                instruments: ["Guitar", "Drums"],
            }), { status: 200 }],
            [JSON.stringify({
                follower_count: 100,
                following_count: 50,
            }), { status: 200 }]
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders user profile correctly", async () => {
        render(
            <AuthProvider>
                <DiscoverProfile />
            </AuthProvider>
        );

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

        expect(screen.getByText("John Doe")).toBeInTheDocument();

        expect(screen.getByText("Years Played:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();

        expect(screen.getByText("Home Studio:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();

        expect(screen.getByText("Genres:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("Rock, Pop")).toBeInTheDocument();

        expect(screen.getByText("Instruments:", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("Guitar, Drums")).toBeInTheDocument();
    });

    it("toggles dropdown menu", async () => {
        render(
            <AuthProvider>
                <DiscoverProfile />
            </AuthProvider>
        );

        const dropdownButton = await screen.findByTestId("dropdown-button");
        
        expect(dropdownButton).toBeInTheDocument();

        fireEvent.click(dropdownButton);

        expect(screen.getByText("Block User")).toBeInTheDocument();

        fireEvent.click(dropdownButton);
        expect(screen.queryByText("Block User")).not.toBeInTheDocument();
    });

    it("shows loading state when data is still loading", async () => {
        fetchMock.resetMocks();

        render(
            <AuthProvider>
                <DiscoverProfile />
            </AuthProvider>
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
    
    it("handles error in fetching user id from username", async () => {
        fetchMock.resetMocks();
        fetchMock.mockReject(new Error("Failed to fetch"));
    
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    
        render(
            <AuthProvider>
                <DiscoverProfile />
            </AuthProvider>
        );
    
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching user ID:", expect.any(Error));
    
        consoleErrorSpy.mockRestore();
    });
});