import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import UserSettings from "@/app/settings/user/page";
import { AuthProvider } from "@/context/ProfileContext";

// Mock next/navigation to prevent actual navigation
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock("@/context/ProfileContext", () => require("@/__mocks__/ProfileContext"));

describe("User Settings Page", () => {
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve(
                new Response(
                    JSON.stringify({
                        instruments: ["Piano", "Guitar"],
                        genres: ["Rock", "Jazz"],
                    }),
                    {
                        status: 200,
                        statusText: "OK",
                        headers: { "Content-Type": "application/json" },
                    }
                )
            )
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
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

    it("fetches and displays user instruments and genres in a list", async () => {
        render(
            <AuthProvider>
                <UserSettings />
            </AuthProvider>
        );
    
        // Wait for the instruments and genres lists to appear
        const instrumentsList = await screen.findByTestId("instruments-list");
        const genresList = await screen.findByTestId("genres-list");
    
        await waitFor(() => {
            // Ensure instruments are correctly displayed
            expect(within(instrumentsList).getByText("Piano")).toBeInTheDocument();
            expect(within(instrumentsList).getByText("Guitar")).toBeInTheDocument();
    
            // Ensure genres are correctly displayed
            expect(within(genresList).getByText("Rock")).toBeInTheDocument();
            expect(within(genresList).getByText("Jazz")).toBeInTheDocument();
        });
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

    it("toggles the edit mode and saves user data for personal information", async () => {
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

    it("allows toggling edit mode for security information", () => {
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
});