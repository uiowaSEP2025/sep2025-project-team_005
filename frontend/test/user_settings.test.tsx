import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import UserSettings from "@/app/settings/user/page";
import { AuthProvider } from "@/context/ProfileContext";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

// Mock next/navigation to prevent actual navigation
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock("@/context/ProfileContext", () => require("@/__mocks__/ProfileContext"));

describe("User Settings Page", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponse(
            JSON.stringify({
                instruments: [{ instrument_name: "Piano", years_played: 3 }, { instrument_name: "Guitar", years_played: 3 }],
                genres: ["Rock", "Jazz"],
            })
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("displays fetched user data correctly", async () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );
    
        const usernameInput = await screen.findByLabelText(/Username/i);
        expect((usernameInput as HTMLInputElement).value).toBe("testuser");
    
        const emailInput = await screen.findByLabelText(/Email/i);
        expect((emailInput as HTMLInputElement).value).toBe("test@example.com");
    });

    it("format phone number correctly", async () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );

        const phoneInput = await screen.findByLabelText(/Phone/i);
        
        fireEvent.change(phoneInput, { target: { value: "1234567890" } });
        expect((phoneInput as HTMLInputElement).value).toBe("(123) 456-7890");

        fireEvent.change(phoneInput, { target: { value: "987654321" } });
        expect((phoneInput as HTMLInputElement).value).toBe("(987) 654-321");
    });

    it("renders the user settings page for an authenticated user", () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );

        expect(screen.getByText(/User Settings/i)).toBeInTheDocument();
        expect(screen.getByText(/Personal Information/i)).toBeInTheDocument();
        expect(screen.getByText(/Experience Information/i)).toBeInTheDocument();
        expect(screen.getByText(/Security Information/i)).toBeInTheDocument();
    });

    it("allows toggling edit mode for personal information", () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );

        const editButtons = screen.getAllByText(/Edit/i);
        const editSecurityButton = editButtons[2];
        fireEvent.click(editSecurityButton);
        expect(editSecurityButton.textContent).toBe("Done");
    });

    it("saves user data when toggling edit mode for personal information", async () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );
    
        const editButtons = screen.getAllByText(/Edit/i);
        const editPersonalInfoButton = editButtons[0];
        fireEvent.click(editPersonalInfoButton);
    
        const usernameInput = screen.getByLabelText(/Username/i);
        fireEvent.change(usernameInput, { target: { value: "newUsername" } });
    
        fireEvent.click(editPersonalInfoButton);

        expect((usernameInput as HTMLInputElement).value).toBe("newUsername");
    });

    it("allows toggling edit mode for experience information", () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );

        const editButtons = screen.getAllByText(/Edit/i);
        const editExperienceButton = editButtons[1]; // Assuming it's the experience section
        fireEvent.click(editExperienceButton);
        expect(editExperienceButton.textContent).toBe("Done");
    });

    it("adds a new instrument to the list", async () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );

        const editButtons = screen.getAllByText(/Edit/i);
        fireEvent.click(editButtons[1]);
    
        const instrumentAddButton = await screen.findByTestId("instruments-add-button");
        fireEvent.click(instrumentAddButton);
    
        const instrumentInput = screen.getByPlaceholderText(/Add Instrument/i);
        fireEvent.change(instrumentInput, { target: { value: "Drums" } });

        const yearsPlayedInput = screen.getByPlaceholderText(/Years played/i);
        fireEvent.change(yearsPlayedInput, { target: { value: "5" } });
    
        const addConfirmButton = await screen.findByTestId("instruments-confirm-add");
        fireEvent.click(addConfirmButton);
    
        const instrumentText = await screen.findByText("Drums - 5 years");
        expect(instrumentText).toBeInTheDocument();
    });

    it("removes an instrument from the list", async () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );
    
        const editButtons = screen.getAllByText(/Edit/i);
        fireEvent.click(editButtons[1]);

        const removeButtons = await screen.findAllByTestId("remove-button-0");
        fireEvent.click(removeButtons[0]);

        expect(screen.queryByText("Piano")).not.toBeInTheDocument();
    });

    it("adds a new genre to the list", async () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );

        const editButtons = screen.getAllByText(/Edit/i);
        fireEvent.click(editButtons[1]);
    
        const genreAddButton = await screen.findByTestId("genres-add-button");
        fireEvent.click(genreAddButton);
    
        const instrumentInput = screen.getByPlaceholderText(/Add genre/i);
        fireEvent.change(instrumentInput, { target: { value: "Pop" } });
    
        const addConfirmButton = await screen.findByTestId("genre-confirm-add");
        fireEvent.click(addConfirmButton);
    
        expect(screen.getByText("Pop")).toBeInTheDocument();
    });

    it("toggles password visibility in security section", () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );
    
        const securitySection = screen.getByText(/Security Information/i).closest('div');
        if (!securitySection) {
            throw new Error("Security section not found");
        }
    
        // Enable editing
        const editButton = within(securitySection).getByText(/Edit/i);
        fireEvent.click(editButton);
    
        // Find the password input
        const passwordInput = within(securitySection).getByLabelText(/Current Password/i);
        const eyeButtons = within(securitySection).getAllByRole("button");
        const eyeButton = eyeButtons.find(button =>
            button.querySelector("svg.lucide-eye")
        );
        if (!eyeButton) throw new Error("Eye button not found");
    
        expect(passwordInput).toHaveAttribute("type", "password");
    
        fireEvent.click(eyeButton);
        expect(passwordInput).toHaveAttribute("type", "text");
    
        fireEvent.click(eyeButton);
        expect(passwordInput).toHaveAttribute("type", "password");
    });    
    

    it("alerts when trying to change password with empty fields", async () => {
        global.alert = jest.fn(); 

        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );

        const securitySection = screen.getByText(/Security Information/i).closest('div');
        if (!securitySection) {
            throw new Error("Security section not found");
        }

        const editSecurityButton = within(securitySection).getByText(/Edit/i);
        fireEvent.click(editSecurityButton);

        const saveButton = within(securitySection).getByText(/Done/i);
        fireEvent.click(saveButton); // Submit with empty password fields

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith("Please enter both the current and new passwords.");
        });

        jest.restoreAllMocks();    
    });
});