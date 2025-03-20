import { render, screen, fireEvent } from "@testing-library/react";
import SignUpSelection from "@/app/signup/page";
import MusicianSignup from "@/app/signup/musician/page";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { mock } from "node:test";
import { fetch } from 'undici';  // For mocking fetch, as Jest does not provide a built-in fetch API
import { act } from "react";

jest.mock('undici', () => ({
  fetch: jest.fn(),
}));

(global as any).fetch = fetch;

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Sign up option page testing (page where you select your role)
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

// Musician signup page
describe("Musician Signup Page", () => {
  // Check that the page is rendered correctly and the expected UI elements are present
  it("renders the musician sign up title, the sign up form, and the submit button", async () => {
    // Create a mock function to simulate the fetch required for fetchInstruments and fetchGenres
    const mockFetch = jest.fn().mockRejectedValue({ ok: true });
    global.fetch = mockFetch;

    // Render the musician sign up page wrapped in an act method since the instrument and genres states will be updated via fecth
    await act( async () => {
      render(<MusicianSignup />);
    });

    // Check that the title "Sign Up: Musician" is displayed
    expect(screen.getByRole("heading", { level: 1, name: /Sign Up: Musician/i})).toBeInTheDocument();

    // Check that the sign up form exists for user input
    expect(document.querySelector("form")).toBeInTheDocument();

    // Check that th submit button is present
    expect(screen.getByRole("button", { name: /Sign Up/i})).toBeInTheDocument();
  });
});
