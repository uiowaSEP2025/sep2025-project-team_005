import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FollowPage from "@/app/profile/follow/[id]/page";
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

describe("FollowPage", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
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

        render(
            <AuthProvider>
                <FollowPage />
            </AuthProvider>
        );

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

        render(
            <AuthProvider>
                <FollowPage />
            </AuthProvider>
        );

        await waitFor(() => screen.getByText("user1"));

        // Search input behavior
        const searchInput = screen.getByPlaceholderText("Search users...");
        fireEvent.change(searchInput, { target: { value: "user1" } });

        // Check if only "user1" is shown
        expect(screen.getByText("user1")).toBeInTheDocument();
        expect(screen.queryByText("user2")).toBeNull();
    });

    it('should load more users when "Load More" is clicked', async () => {
        render(
          <AuthProvider>
            <FollowPage />
          </AuthProvider>
        );
        //***************** Finish
    });       

    it("handles follow/unfollow button click", async () => {
        fetchMock.mockResponseOnce(
            JSON.stringify({
                results: [
                    { id: "1", username: "user1", profilePhoto: "/profile1.jpg", isFollowing: false },
                ],
                next: null,
            })
        );

        render(
            <AuthProvider>
                <FollowPage />
            </AuthProvider>
        );

        await waitFor(() => screen.getByText("user1"));

        const followButton = screen.getByText("Follow");

        // Simulate clicking on the follow button
        fireEvent.click(followButton);

        // Mock response for follow action
        fetchMock.mockResponseOnce(
            JSON.stringify({ success: true })
        );

        await waitFor(() => expect(followButton.textContent).toBe("Unfollow"));

        // Simulate clicking on the unfollow button
        fireEvent.click(followButton);

        // Mock response for unfollow action
        fetchMock.mockResponseOnce(
            JSON.stringify({ success: true })
        );

        await waitFor(() => expect(followButton.textContent).toBe("Follow"));
    });
});