import { render, screen, fireEvent } from "@testing-library/react";
import SignUpSelection from "@/app/signup/page";
import MusicianSignup from "@/app/signup/musician/page";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"
import { fetch } from 'undici';  // For mocking fetch, as Jest does not provide a built-in fetch API
import { act } from "react";
import { userEvent } from '@testing-library/user-event';
import exp from "constants";

// Mock fetch since jest does not provide a built-in fetch API
jest.mock('undici', () => ({
  fetch: jest.fn(),
}));

(global as any).fetch = fetch;

// Mock the useRouter hook and usePathname
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
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
    // Mock fetch to return different data based on the URL
    jest.spyOn(global, 'fetch').mockImplementation((url: string | URL | Request) => {
      // Mock for fetching instruments
      if (url.toString().includes('instruments')) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue([
            { instrument: 'Guitar' },
            { instrument: 'Piano' },
            { instrument: 'Violin' },
          ]),
        } as unknown as Response);
      }

      // Mock for fetching genres
      if (url.toString().includes('genres')) {
        return Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue([
            { genre: 'Pop' },
            { genre: 'Classical' },
            { genre: 'Contemporary' },
          ]),
        } as unknown as Response);
      }

      // Default response if no match (optional)
      return Promise.reject('Unknown URL');
    });

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
    await user.clear(yearsPlayedInput);

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
    await user.click(addInstrumentButton);

    // Check that there are now 2 instrument input UI elements
    instrumentInputs = screen.getAllByPlaceholderText('Instrument');
    expect(instrumentInputs.length).toBe(2);

    // Now simulate user clicking the remove instrument button
    const removeButtons = screen.getAllByRole('button', { name: /➖/i });
    await user.click(removeButtons[1]); // Remove the second instrument field

    // Check that we now only have one instrument field
    instrumentInputs = screen.getAllByPlaceholderText('Instrument');
    expect(instrumentInputs.length).toBe(1);
  });

  // Check that the genres drop down menu functions as intended
  it("allows the user to type into the genre text box and displays autocomplete genre options", async () => {
    // Find the genre input field
    const genreInput = screen.getByPlaceholderText('Genre');

    // Simulate the user typing in the first few letters of the genre they are looking for
    await user.type(genreInput, 'Po');

    // Wait for autocomplete dropdown menu to appear
    const autocompleteOption = await screen.findByText('Pop');

    // Simulate the user clicking this option in the drop down menu
    await user.click(autocompleteOption);

    expect(genreInput).toHaveValue("Pop");
  });

  // Check that the user can add and remove genre input fields
  it("allows the user to add another genre field and remove genre fields", async () => {
    // First, check that there is currently only one genre input field present
    let genreInputs = screen.getAllByPlaceholderText('Genre');
    expect(genreInputs.length).toBe(1);

    // Type something in the first genre input so that the user is allowed to add another
    const genreInput1 = screen.getByPlaceholderText('Genre');
    await user.type(genreInput1, "Clas");
    const autocompleteOption = await screen.findByText("Classical");
    await user.click(autocompleteOption);

    // Simulate the user clicking the add genre option
    const addGenreButton = screen.getByText('+ Add another genre');
    await user.click(addGenreButton);

    // Check that there are now 2 genre input UI elements
    genreInputs = screen.getAllByPlaceholderText('Genre');
    expect(genreInputs.length).toBe(2);

    // Now simulate the user clicking the remove genre button
    const removeButtons = screen.getAllByRole('button', { name: /➖/i });
    await user.click(removeButtons[1]);   // Remove the second genre field

    // Check that we now only have one genre field
    genreInputs = screen.getAllByPlaceholderText('Genre');
    expect(genreInputs.length).toBe(1);
  });

  // Check that the password input provides validation, showing an error message if the password is not strong
  it("checks for a strong password upon password input and removes error message when input is fixed", async () => {
    // Find the password text box and type in something that is not a strong password
    const passwordInput = screen.getByLabelText(/Password/i);
    await user.type(passwordInput, "weakpassword");

    // With this weak password, there should be a message in red beneath the password input box telling the user it is not a strong enough password
    expect(await screen.findByText(/Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character./i)).toBeInTheDocument();

    // Now clear the password input box and type something valid and ensure that message goes away
    await user.clear(passwordInput);
    await user.type(passwordInput, "StrongPass@789")

    // Check that the error message is now gone (use queryByText here since it will return null if not found)
    expect(screen.queryByText(/Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character./i)).not.toBeInTheDocument();
  });



  // Testing for form submission and validation of the musician sign up page:
  describe("Form Submission", () => {
    let emailInput: HTMLInputElement;
    let usernameInput: HTMLInputElement;
    let passwordInput: HTMLInputElement;
    let stageNameInput: HTMLInputElement;
    let yesRadioButton: HTMLInputElement;
    let noRadioButton: HTMLInputElement;
    let instrumentInput: HTMLInputElement;
    let yearsPlayedInput: HTMLInputElement;
    let genreInput: HTMLInputElement;
    let submitButton: HTMLInputElement;

    // Before the form submission tests, find all the input elements and type a valid input
    // Inputs will be changed later to check for cases in which invalid input is given
    beforeEach(async () => {
      // Find all UI elements for input
      emailInput = screen.getByLabelText(/Email/i);
      usernameInput = screen.getByLabelText(/Username/i);
      passwordInput = screen.getByLabelText(/Password/i);
      stageNameInput = screen.getByLabelText(/Stage Name/i);
      yesRadioButton = screen.getByLabelText(/Yes/i);
      noRadioButton = screen.getByLabelText(/No/i);
      instrumentInput = screen.getByPlaceholderText('Instrument');
      yearsPlayedInput = screen.getByPlaceholderText('Years played');
      genreInput = screen.getByPlaceholderText('Genre')

      // Give a valid input for each field
      await user.type(emailInput, "jestTesting@test.com");
      await user.type(usernameInput, "jestTesting");
      await user.type(passwordInput, "JestTesting#456");
      await user.type(stageNameInput, "Jest Test Musician");
      await user.click(yesRadioButton);
      // *** Select a drop down option from the instruments list
      await user.type(instrumentInput, "Gu");
      const autocompleteOption = await screen.findByText("Guitar");
      await user.click(autocompleteOption);
      // ***
      await user.type(yearsPlayedInput, "7");
      // *** Select a drop down option from the genres list
      await user.type(genreInput, "Conte");
      const autocompleteGenreOption = await screen.findByText("Contemporary");
      await user.click(autocompleteGenreOption);
      // ***

      // Get the submit button UI element
      submitButton = screen.getByRole("button", { name: /Sign Up/i});
      
      // Mock the useRouter hook to simulate being on the sign-up page
      (usePathname as jest.Mock).mockReturnValue({ pathname: "/signup/musician" });
    })

    // Check that upon submit, the form checks for a valid email format
    it("does not allow submission if email is not in a valid format", async () => {
      // Clear the email input field and input something that is not valid
      await user.clear(emailInput)
      await user.type(emailInput, "invalidemail")

      // Click submit
      await user.click(submitButton);

      // Trigger form submission manually since Jest and RTL do not automatically simulate this native browser validation
      // (Used built-in HTML 5 validation for email, so need to simulate this)
      fireEvent.submit(screen.getByRole('form'));

      // Ensure that we stay on the same page and see the message for invalid email input
      expect(usePathname()).toHaveProperty('pathname', "/signup/musician")
      expect(await screen.findByText(/Please enter a valid email address./i)).toBeInTheDocument();
    });
  });    
});