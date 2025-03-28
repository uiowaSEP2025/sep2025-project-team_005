import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Discover from "@/app/discover/page"; // Adjust path if necessary
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import axios from "axios";
import { useRouter } from "next/navigation";

jest.mock("@/context/ProfileContext", () => ({
    useAuth: jest.fn(),
    useRequireAuth: jest.fn(),
}));

jest.mock("axios");

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

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

        render(<Discover />);
    
        expect(screen.getByText("Discover Musicians")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search usernames...")).toBeInTheDocument();
    
        // Using findByText to wait for the users to be rendered
        expect(await screen.findByText("user1")).toBeInTheDocument();
        expect(await screen.findByText("user2")).toBeInTheDocument();
    });
    

    it("calls fetchUsers when typing in search", async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: { results: ["user1"], next: null } });
    
        render(<Discover />);
        const input = screen.getByPlaceholderText("Search usernames...");
    
        await act(async () => {
            fireEvent.change(input, { target: { value: "testuser" } });
        });
    
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("https://savvy-note.com/discover/"),
            expect.objectContaining({ params: { search: "testuser", page: 1 } })
        ));
    });

    it("displays users returned from API", async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: { results: ["user1", "user2"], next: null } });

        render(<Discover />);

        expect(screen.getByText("Discover Musicians")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search usernames...")).toBeInTheDocument();

        // Using findByText to wait for the users to be rendered
        expect(await screen.findByText("user1")).toBeInTheDocument();
        expect(await screen.findByText("user2")).toBeInTheDocument();
    });


    it("displays 'No users found' if API returns empty results", async () => {
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: { results: [], next: null } });

        render(<Discover />);

        await waitFor(() => {
            expect(screen.getByText("No users found.")).toBeInTheDocument();
        });
    });      
});
