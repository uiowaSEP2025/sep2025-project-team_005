import { render, screen } from "@testing-library/react";
import Profile from "@/app/profile/page";
import { AuthProvider } from "@/context/ProfileContext";

// Mock next/navigation to prevent actual navigation
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock("@/context/ProfileContext", () => require("@/__mocks__/ProfileContext"));

describe("Profile Page", () => {
    it("renders the profile page for an authenticated user", () => {
        render(
            <AuthProvider>
                <Profile />
            </AuthProvider>
        );

        expect(screen.getByText(/testuser's Profile/i)).toBeInTheDocument();
        expect(screen.getByText(/First Name: Test/i)).toBeInTheDocument();
        expect(screen.getByText(/Last Name: User/i)).toBeInTheDocument();
        expect(screen.getByText(/Role: musician/i)).toBeInTheDocument();
    });
});