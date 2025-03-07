import { render, screen, fireEvent } from "@testing-library/react";
import Signup from "@/app/signup/page";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Signup Page", () => {
  test("does not redirect when submitting an empty form", async () => {
    // Mock implementation for useRouter
    const mockPush = jest.fn();
    
    // Mock the return value of useRouter
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(<Signup />);

    // Find the submit button
    const submitButton = screen.getByRole("button", { name: /Sign Up/i });
    
    // Simulate clicking the submit button without filling out the form
    fireEvent.click(submitButton);

    // Check if the router's push function was not called, ensuring the user stays on the signup page
    expect(mockPush).not.toHaveBeenCalled();
  });
});
