import { render, screen, fireEvent } from "@testing-library/react";
import SignUpSelection from "@/app/signup/page";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { mock } from "node:test";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Signup Page", () => {
  // Check that the expected UI elements are rendered
  it("renders the sign up label, select your role header, and role selection cards", () => {
    render(<SignUpSelection />);

    // Note using get by text here because using a lot of custom CSS, so trying to recognize labels or buttons can be finicky
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Select your role:")).toBeInTheDocument();
    expect(screen.getByText("Musician")).toBeInTheDocument();
    expect(screen.getByText("Business")).toBeInTheDocument();
  });

  // Check that when the user clicks "Musician", they are routed to the musician signup
  it("redirects to the musician signup page when Musician is clicked", () => {
    // Create a mock function to simulate router.push()
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(<SignUpSelection />);
    fireEvent.click(screen.getByText("Musician"));

    // Check if that mocked function was called, testing proper rerouting
    expect(mockPush).toHaveBeenCalledWith("/signup/musician");
  });

  // Check that when the user clicks "Business", they are routed to the musician signup
  it("redirects to the business signup page when Business is clicked", () => {
    // Create a mock function to simulate router.push()
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(<SignUpSelection />);
    fireEvent.click(screen.getByText("Business"));

    // Check if that mocked function was called, testing proper rerouting
    expect(mockPush).toHaveBeenCalledWith("/signup/business");
  });
});
