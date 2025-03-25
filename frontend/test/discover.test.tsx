import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Discover from "@/app/discover/page";
import { useAuth } from "@/context/ProfileContext";
import axios from "axios";
import { useRouter } from "next/navigation";

jest.mock("axios");
jest.mock("lodash.debounce", () => (fn: any) => {
    const debounced = (...args: any) => fn(...args);
    debounced.cancel = () => {};
    return debounced;
});
jest.mock("next/navigation", () => ({useRouter: jest.fn(),}));

jest.mock("@/context/ProfileContext", () => ({useAuth: jest.fn(),}));

describe("Discover User UI", () => {
    const mockPush = jest.fn();
    
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (useAuth as jest.Mock).mockReturnValue({ profile: {}, isLoading: false });
    });

    it("renders the component correctly", () => {
        render(<Discover />);
        expect(screen.getByText("Discover Musicians")).toBeInTheDocument();
        expect(screen.getByText("Search for musicians and connect with them.")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search usernames...")).toBeInTheDocument();
    });

    it("updates search term state on user input", () => {
        render(<Discover />);
        const input = screen.getByPlaceholderText("Search usernames...");
        fireEvent.change(input, { target: { value: "test" } });
        expect(input).toHaveValue("test");
    });

    it("calls fetchUsers when typing in search", async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: { results: ["user1"], next: null } });
    
        render(<Discover />);
        const input = screen.getByPlaceholderText("Search usernames...");
    
        await act(async () => {
            fireEvent.change(input, { target: { value: "testuser" } });
        });
    
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("https://savvy-note.com:8000/discover/"),
            expect.objectContaining({ params: { search: "testuser", page: 1 } })
        ));
    });

    it("displays users returned from API", async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: { results: ["user1", "user2"], next: null } });

        render(<Discover />);
        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());
        expect(screen.getByText("user2")).toBeInTheDocument();
    });

    it("navigates to user profile on click", async () => {
        (axios.get as jest.Mock).mockResolvedValue({ data: { results: ["user1"], next: null } });

        render(<Discover />);
        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());

        fireEvent.click(screen.getByText("user1"));
        expect(mockPush).toHaveBeenCalledWith("/profile/discoverprofile/user1");
    });

    it("shows loading text while fetching users", async () => {
        (axios.get as jest.Mock).mockImplementation(() => 
            new Promise((resolve) => setTimeout(() => resolve({ data: { results: ["user1"], next: null } }), 500))
        );

        render(<Discover />);
        fireEvent.change(screen.getByPlaceholderText("Search usernames..."), { target: { value: "testuser" } });

        expect(screen.getByText("Loading users...")).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByText("Loading users...")).not.toBeInTheDocument());
    });

    it("loads more users when 'Load More' button is clicked", async () => {
        (axios.get as jest.Mock)
            .mockResolvedValueOnce({ data: { results: ["user1"], next: true } })
            .mockResolvedValueOnce({ data: { results: ["user2"], next: null } });

        render(<Discover />);
        await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument());

        fireEvent.click(screen.getByText("Load More"));

        await waitFor(() => expect(screen.getByText("user2")).toBeInTheDocument());
    });
});
