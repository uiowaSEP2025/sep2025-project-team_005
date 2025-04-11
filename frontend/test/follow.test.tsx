import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FollowPage from "@/app/follow/[id]/page";
import { AuthProvider } from "@/context/ProfileContext";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
    useParams: () => ({
        id: "testId",
    }),
    useSearchParams: () => ({
        get: jest.fn().mockReturnValue("followers"),
    }),
}));

// Mock the entire module
jest.mock("@/context/ProfileContext", () => ({
    useAuth: jest.fn(),
    useRequireAuth: jest.fn(),
}));

describe("FollowPage", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
        const mockUseAuth = require("@/context/ProfileContext").useAuth;
        mockUseAuth.mockReturnValue({
          profile: { id: "2" },  // Mock profile with id "2"
          setProfile: jest.fn(),
          isLoading: false,
          fetchProfile: jest.fn(),
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders user profile correctly", async () => {
        // Mocking API response
        fetchMock.mockResponseOnce(
            JSON.stringify({
                results: [
                    { id: "1", username: "user1", profilePhoto: "/profile1.jpg", isFollowing: false },
                    { id: "2", username: "user2", profilePhoto: "/profile2.jpg", isFollowing: true },
                ],
                next: "nextPageUrl",
            })
        );

        render(<FollowPage />);

        // Wait for the users to appear in the list
        await waitFor(() => screen.getByText("user1"));
        expect(screen.getByText("user1")).toBeInTheDocument();
        expect(screen.getByText("user2")).toBeInTheDocument();
        expect(screen.getByAltText("user1's profile photo")).toBeInTheDocument();
        expect(screen.getByAltText("user2's profile photo")).toBeInTheDocument();
    });

    it("filters users based on search input", async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({
                results: [
                    { id: "1", username: "user1", profilePhoto: "/profile1.jpg", isFollowing: false },
                    { id: "2", username: "user2", profilePhoto: "/profile2.jpg", isFollowing: true },
                ],
                next: "nextPageUrl",
            })
        );

        render(<FollowPage />);

        await waitFor(() => screen.getByText("user1"));

        // Search input behavior
        const searchInput = screen.getByPlaceholderText("Search users...");
        fireEvent.change(searchInput, { target: { value: "user1" } });

        // Check if only "user1" is shown
        expect(screen.getByText("user1")).toBeInTheDocument();
        expect(screen.queryByText("user2")).toBeNull();
    });

    it('should load more users when "Load More" is clicked', async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({
                results: [
                    { id: "1", username: "user1", profilePhoto: "/profile1.jpg", isFollowing: false },
                    { id: "2", username: "user2", profilePhoto: "/profile2.jpg", isFollowing: true },
                ],
                next: "nextPageUrl",
            })
        );
    
        render(<FollowPage />);
    
        await waitFor(() => screen.getByText("user1"));
    
        // Assert that users are displayed
        expect(screen.getByText("user1")).toBeInTheDocument();
        expect(screen.getByText("user2")).toBeInTheDocument();
    
        // Mock the next page of users
        fetchMock.mockResponseOnce(
            JSON.stringify({
                results: [
                    { id: "3", username: "user3", profilePhoto: "/profile3.jpg", isFollowing: false },
                    { id: "4", username: "user4", profilePhoto: "/profile4.jpg", isFollowing: true },
                ],
                next: null, // Simulating no more users to load
            })
        );
    
        const loadMoreButton = screen.getByText("Load More");
        fireEvent.click(loadMoreButton);
    
        // Wait for the second batch of users to load
        await waitFor(() => screen.getByText("user3"));
    
        // Assert that the new users are displayed
        expect(screen.getByText("user1")).toBeInTheDocument();
        expect(screen.getByText("user2")).toBeInTheDocument();
        expect(screen.getByText("user3")).toBeInTheDocument();
        expect(screen.getByText("user4")).toBeInTheDocument();
    
        // Assert that the "Load More" button is no longer displayed since there's no more data
        expect(screen.queryByText("Load More")).toBeNull();
    });           

    it("handles follow/unfollow button click", async () => {
        // Mock the `useRequireAuth` hook to prevent redirect or authentication issues
        const mockUseRequireAuth = require("@/context/ProfileContext").useRequireAuth;
        mockUseRequireAuth.mockImplementation(() => {}); // Do nothing on call
      
        // Mock API response for users
        fetchMock.mockResponseOnce(
          JSON.stringify({
            results: [
              { id: "1", username: "user1", profilePhoto: "/profile1.jpg", isFollowing: false },
            ],
            next: null,
          })
        );
      
        render(<FollowPage />);
        await waitFor(() => screen.getByText("user1"));
      
        // Ensure the Follow button is rendered
        const followButton = screen.getByText("Follow");
      
        fireEvent.click(followButton);
      
        // Mock response for follow action
        fetchMock.mockResponseOnce(
          JSON.stringify({ success: true })
        );
      
        await waitFor(() => expect(followButton.textContent).toBe("Unfollow"));
      
        fireEvent.click(followButton);
        
        fetchMock.mockResponseOnce(
          JSON.stringify({ success: true })
        );
      
        await waitFor(() => expect(followButton.textContent).toBe("Follow"));
    });
});