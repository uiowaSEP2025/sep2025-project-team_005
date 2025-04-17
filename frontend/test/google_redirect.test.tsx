import { render, waitFor } from "@testing-library/react";
import GoogleAuthRedirect from "@/app/google-auth/page";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/ProfileContext";

// Mock nex-auth, routing, axios, and profile context
jest.mock("next-auth/react");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));
jest.mock("axios");
jest.mock("@/context/ProfileContext");


// Utility function to mock the session and auth state
const mockSession = (status: "authenticated" | "unauthenticated", email = "test@example.com", id = "google-id") => {
    (useSession as jest.Mock).mockReturnValue({
      data: status === "authenticated" ? { user: { email, id } } : null,
      status,
    });
};


describe("Google Authentication Redirect", () => {
    const pushMock = jest.fn();
    const fetchProfileMock = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
        (useAuth as jest.Mock).mockReturnValue({ fetchProfile: fetchProfileMock });
        jest.clearAllMocks();
    });

    test("redirects to user's page on successful google login (200 response)", async () => {
        mockSession("authenticated");
    
        (axios.post as jest.Mock).mockResolvedValue({
          status: 200,
          data: {
            user: { username: "testuser" },
          },
        });
    
        render(<GoogleAuthRedirect />);
    
        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            `${process.env.BACKEND_API}/api/auth/google-login/`,
            {
              email: "test@example.com",
              google_id: "google-id",
              credentials: "include",
            },
            { withCredentials: true }
          );
          expect(fetchProfileMock).toHaveBeenCalled();
          expect(pushMock).toHaveBeenCalledWith("/testuser");
        });
    });

    test("redirects to signup page if a user does not yet exist with that email (202 response)", async () => {
        mockSession("authenticated", "newuser@example.com");
    
        (axios.post as jest.Mock).mockResolvedValue({
          status: 202,
        });
    
        render(<GoogleAuthRedirect />);
    
        await waitFor(() => {
          expect(pushMock).toHaveBeenCalledWith("/signup?email=newuser%40example.com");
        });
    });
    
    test("redirects to login on unexpected backend status", async () => {
        mockSession("authenticated");
    
        (axios.post as jest.Mock).mockResolvedValue({
          status: 403,
        });
    
        render(<GoogleAuthRedirect />);
    
        await waitFor(() => {
          expect(pushMock).toHaveBeenCalledWith("/login?error=backend");
        });
    });
    
    test("redirects to login on network error", async () => {
        mockSession("authenticated");
    
        (axios.post as jest.Mock).mockRejectedValue(new Error("Network Error"));
    
        render(<GoogleAuthRedirect />);
    
        await waitFor(() => {
          expect(pushMock).toHaveBeenCalledWith("/login?error=backend");
        });
    });
})