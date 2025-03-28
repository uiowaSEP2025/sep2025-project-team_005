import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "@/app/login/page";
import axios from "axios";
import { useRouter } from "next/navigation";
import "@testing-library/jest-dom";

// Mock next/router
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mock axios
jest.mock("axios");

// Mock useAuth
jest.mock("@/context/ProfileContext", () => ({
    useAuth: jest.fn(),
}));

import { useAuth } from "@/context/ProfileContext";

describe("Login Component", () => {
    let pushMock: jest.Mock;

    beforeEach(() => {
        pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
        jest.clearAllMocks();
    });

    test("renders login screen correctly", () => {
        (useAuth as jest.Mock).mockReturnValue({
            profile: null,
            isLoading: false,
        });

        render(<Login />);

        expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByText("Login")).toBeInTheDocument();
    });

    test("allows user to type in username and password", () => {
        (useAuth as jest.Mock).mockReturnValue({
            profile: null,
            isLoading: false,
        });

        render(<Login />);

        const usernameInput = screen.getByPlaceholderText("Username");
        const passwordInput = screen.getByPlaceholderText("Password");

        fireEvent.change(usernameInput, { target: { value: "testuser" } });
        fireEvent.change(passwordInput, { target: { value: "testpassword1!" } });

        expect(usernameInput).toHaveValue("testuser");
        expect(passwordInput).toHaveValue("testpassword1!");
    });

    test("successful login redirects to profile", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            profile: { username: "testuser" },
            isLoading: false,
        });

        (axios.post as jest.Mock).mockResolvedValue({
            data: { access: "mock_access_token" },
        });

        render(<Login />);

        fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "testuser" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "testpassword1!" } });

        fireEvent.click(screen.getByText("Login"));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                "https://savvy-note.com/api/auth/login/",
                { username: "testuser", password: "testpassword1!" },
                { withCredentials: true }
            );
            expect(pushMock).toHaveBeenCalledWith("/testuser");
        });
    });

    test("failed login shows error message", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            profile: null,
            isLoading: false,
        });

        (axios.post as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));

        render(<Login />);

        fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "wronguser" } });
        fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrongpass1!" } });

        fireEvent.click(screen.getByText("Login"));

        await waitFor(() => {
            expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
        });
    });
});