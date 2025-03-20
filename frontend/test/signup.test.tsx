import { render, screen, fireEvent } from "@testing-library/react";
import SignUpSelection from "@/app/signup/page";
import MusicianSignup from "@/app/signup/musician/page";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { fetch } from 'undici';  // For mocking fetch, as Jest does not provide a built-in fetch API
import { act } from "react";
import { userEvent } from '@testing-library/user-event';
import exp from "constants";

// Mock fetch since jest does not provide a built-in fetch API
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
  // First create the mock function to simulate the fetch required for fetchInstruments and fetchGenres
  const mockFetch = jest.fn().mockRejectedValue({ ok: true });
  global.fetch = mockFetch;

  let user: any;

  // Before each test, render the musician signup page, create a user to perform events, and use the mocked fetch function to have a few instruments and genres
  beforeEach(async () => {
    // Mock fetching instruments before rendering page
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([
        { instrument: 'Guitar'},
        { instrument: 'Piano' },
        { instrument: 'Violin' },
      ]),
    } as unknown as Response);

    // Wrap the rendering of the sign up page in an act method since the intruments and genres states will be updated via fetch
    await act(async () => {
      render(<MusicianSignup />);
    });

    // Create user
    user = userEvent.setup();

    
  });

  // Check that the page is rendered correctly and the expected UI elements are present
  it("renders the musician sign up title, the sign up form, and the submit button", async () => {
    // Check that the title "Sign Up: Musician" is displayed
    expect(screen.getByRole("heading", { level: 1, name: /Sign Up: Musician/i})).toBeInTheDocument();

    // Check that the sign up form exists for user input
    expect(document.querySelector("form")).toBeInTheDocument();

    // Check that th submit button is present
    expect(screen.getByRole("button", { name: /Sign Up/i})).toBeInTheDocument();
  });

  // Check that the user can type in the text boxes so they can input the required information
  it("allows the user to type information into the basic input fields", async () => {
    // Find each input text field that is just one simple text input (email, username, password, stage name)
    const emailInput = screen.getByLabelText(/Email/i);
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const stageNameInput = screen.getByLabelText(/Stage Name/i);

    // Type test values into these input text fields
    await user.type(emailInput, "test@gmail.com");
    await user.type(usernameInput, "testUser");
    await user.type(passwordInput, "testUser!123");
    await user.type(stageNameInput, "Test Musician");

    // Check if the values have been properly typed
    expect(emailInput).toHaveValue("test@gmail.com");
    expect(usernameInput).toHaveValue("testUser");
    expect(passwordInput).toHaveValue("testUser!123");
    expect(stageNameInput).toHaveValue("Test Musician");
  });

  // Check that the user can select "yes" or "no" for the home studio radio buttons
  it("allows the user to indicate if they have a home studio", async () => {
    // Find the yes and no radio buttons
    const yesRadioButton = screen.getByLabelText(/Yes/i);
    const noRadioButton = screen.getByLabelText(/No/i);

    // Simulate the user selecting yes
    await user.click(yesRadioButton);

    // Check that the yes radio button is currently selected, and not no
    expect(yesRadioButton).toBeChecked();
    expect(noRadioButton).not.toBeChecked();

    // Repeat but with selecting no
    await user.click(noRadioButton);

    expect(yesRadioButton).not.toBeChecked();
    expect(noRadioButton).toBeChecked();
  });

  // Check that the instrument input section functions as intended
  it("allows the user to type into the instrument text box and displays autocomplete instrument options", async () => {
    // Find the instrument input field
    const instrumentInput = screen.getByPlaceholderText('Instrument');

    // Simulate the user typing in the first few letters of an instrument they are looking for
    await user.type(instrumentInput, "Pia");

    // Wait for the autocomplete drop down menu to appear
    const autocompleteOption = await screen.findByText("Piano");

    // Simulate the user clicking this option in the drop down menu
    await user.click(autocompleteOption);

    // Check if the text in the input text box now contains the user selection
    expect(instrumentInput).toHaveValue("Piano");
  });

  // Check that the user can input years played and only numbers are accepted
  it("allows the user to type into the years played text box and only allows numbers", async () => {
    // Find the years played input field
    const yearsPlayedInput = screen.getByPlaceholderText('Years played');

    // Simulate the user typing a number in the input field
    await user.type(yearsPlayedInput, "7");

    // Check that the value has been set correctly in the input field
    expect(yearsPlayedInput).toHaveValue(7);

    // Clear the input field
    await userEvent.clear(yearsPlayedInput);

    // Now, try entering an invalid input
    await user.type(yearsPlayedInput, "invalid");

    // Check that this does not get typed into the text box
    expect(yearsPlayedInput).toHaveValue(null);
  });

  // Check that the user can add another instrument input field
  it("allows the user to add another instrument input field and remove instrument fields", async () => {
    // First, check that there is currently only one instrument input field present
    let instrumentInputs = screen.getAllByPlaceholderText('Instrument');
    expect(instrumentInputs.length).toBe(1);

    // Type something in the first instruments input so that user is allowed to add another
    const instrumentInput1 = screen.getByPlaceholderText('Instrument');
    await user.type(instrumentInput1, "Viol");
    const autocompleteOption = await screen.findByText("Violin");
    await user.click(autocompleteOption);

    // Simulate clicking the add instrument button
    const addInstrumentButton = screen.getByText('+ Add another instrument');
    await userEvent.click(addInstrumentButton);

    // Check that there are now 2 instrument input UI elements
    instrumentInputs = screen.getAllByPlaceholderText('Instrument');
    expect(instrumentInputs.length).toBe(2);

    // Now simulate user clicking the remove instrument button
    const removeButtons = screen.getAllByRole('button', { name: /➖/i });
    await userEvent.click(removeButtons[1]); // Remove the second instrument field

    // Check that we now only have on instrument field
    instrumentInputs = screen.getAllByPlaceholderText('Instrument');
    expect(instrumentInputs.length).toBe(1);
  });
});