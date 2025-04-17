import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Discover from "@/app/discover/page"; // Adjust path if necessary
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/context/ThemeContext";

jest.mock("@/context/ProfileContext", () => ({
    useAuth: jest.fn(),
    useRequireAuth: jest.fn(),
}));

jest.mock("axios");

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

const renderDiscover = () => {
    render(
        <ThemeProvider>
            <Discover />
        </ThemeProvider>
    );
};

describe("Discover Page", () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            profile: { username: "testuser" },
            isLoading: false,
        });
        (useRequireAuth as jest.Mock).mockReturnValue(null);
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

        jest.clearAllMocks();
    });

    it("renders the Discover page correctly", async () => {
        // Ensure axios mock resolves with data correctly
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url.includes("instruments")) {
                return Promise.resolve({ data: ["Guitar", "Piano"] });
            }
            if (url.includes("genres")) {
                return Promise.resolve({ data: ["Jazz", "Rock"] });
            }
            if (url.includes("discover")) {
                return Promise.resolve({ data: { results: ["user1", "user2"], next: null } });
            }
            return Promise.reject(new Error("Unexpected API call"));
        });

        renderDiscover();
    
        expect(screen.getByText("Discover Musicians")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search usernames...")).toBeInTheDocument();
    
        // Using findByText to wait for the users to be rendered
        expect(await screen.findByText("user1")).toBeInTheDocument();
        expect(await screen.findByText("user2")).toBeInTheDocument();
    });

    it("displays 'No users found' if API returns empty results", async () => {
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url.includes("instruments")) {
                return Promise.resolve({ data: ["Guitar", "Piano"] });
            }
            if (url.includes("genres")) {
                return Promise.resolve({ data: ["Jazz", "Rock"] });
            }
            if (url.includes("discover")) {
                return Promise.resolve({ data: { results: [], next: null } });
            }
            return Promise.reject(new Error("Unexpected API call"));
        });

        renderDiscover();

        await waitFor(() => {
            expect(screen.getByText("No users found.")).toBeInTheDocument();
        });
    });

    it("triggers search fetch on input", async () => {
        renderDiscover();
        const searchInput = screen.getByPlaceholderText("Search usernames...");
        fireEvent.change(searchInput, { target: { value: "test" } });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
    });

    it("navigates to user profile on click", async () => {
        // Mock axios to return user results
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url.includes("instruments")) {
                return Promise.resolve({ data: ["Guitar", "Piano"] });
            }
            if (url.includes("genres")) {
                return Promise.resolve({ data: ["Jazz", "Rock"] });
            }
            if (url.includes("discover")) {
                return Promise.resolve({ data: { results: ["user1"], next: null } });
            }
            return Promise.reject(new Error("Unexpected API call"));
        });
    
        const mockPush = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
        renderDiscover();
    
        const userElement = await screen.findByText("user1");
        fireEvent.click(userElement);
    
        expect(mockPush).toHaveBeenCalledWith("/user1/");
    });    

    it("renders search input and updates on change", () => {
        renderDiscover();

        const searchInput = screen.getByPlaceholderText(/search usernames/i);
        fireEvent.change(searchInput, { target: { value: 'john' } });

        expect(searchInput).toHaveValue('john');
    });

    it("calls fetchUsers on load more button click", async () => {
        renderDiscover();

        const loadMoreButton = screen.getByTestId('load-more-button');
        fireEvent.click(loadMoreButton);

        expect(axios.get).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              headers: expect.any(Object),
              params: expect.objectContaining({
                page: 2,
            }),
        }))
    });
});