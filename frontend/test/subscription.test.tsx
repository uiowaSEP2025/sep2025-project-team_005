import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Subscription from "@/app/subscription/[id]/page";
import SuccessPage from "@/app/subscription/success/page";
import * as nextNavigation from "next/navigation";
import axios from "axios";

// Mock Stripe's loadStripe function
jest.mock("@stripe/stripe-js", () => ({
    loadStripe: jest.fn().mockResolvedValue({
        redirectToCheckout: jest.fn().mockResolvedValue({}),
    }),
}));

// Mock Next.js useParams and useRouter
jest.mock("next/navigation", () => ({
    useParams: jest.fn(),
    useRouter: jest.fn(),
}));

// Mock axios
jest.mock("axios");

describe("Subscription Component", () => {
    beforeEach(() => {
        jest.spyOn(nextNavigation, "useParams").mockReturnValue({ id: "user-id-123" });
        (axios.post as jest.Mock).mockResolvedValue({ data: { id: "session-id-123" } });
        window.alert = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("should render the Subscription component", () => {
        render(<Subscription />);
        expect(screen.getByText(/Upgrade Your Account/)).toBeInTheDocument();
        expect(screen.getByText(/Unlock powerful tools/)).toBeInTheDocument();
    });

    it("should handle monthly subscription checkout", async () => {
        render(<Subscription />);
        fireEvent.click(screen.getByText("Choose Monthly"));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                "http://localhost:8000/api/stripe/create-subscription-session/",
                { type: "monthly", user_id: "user-id-123" }
            );
        });

        expect(screen.getByText("Choose Monthly")).toBeInTheDocument();
    });

    it("should handle annual subscription checkout", async () => {
        render(<Subscription />);
        fireEvent.click(screen.getByText("Choose Annual"));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                "http://localhost:8000/api/stripe/create-subscription-session/",
                { type: "annual", user_id: "user-id-123" }
            );
        });

        expect(screen.getByText("Choose Annual")).toBeInTheDocument();
    });

    it("should show an error message if Stripe checkout fails", async () => {
        const stripeMock = require("@stripe/stripe-js").loadStripe;
        stripeMock.mockResolvedValue({
            redirectToCheckout: jest.fn().mockResolvedValue({
                error: { message: "Checkout failed" },
            }),
        });

        render(<Subscription />);
        fireEvent.click(screen.getByText("Choose Monthly"));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Checkout failed");
        });
    });

    it("should show the correct plan details", () => {
        render(<Subscription />);
        expect(screen.getByText("$20 / month")).toBeInTheDocument();
        expect(screen.getByText("$200 / year")).toBeInTheDocument();
        expect(screen.getByText("Save $40 annually!")).toBeInTheDocument();
    });
});

describe("SuccessPage", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.resetAllMocks();
    });

    it("renders success message", () => {
        (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

        render(<SuccessPage />);

        expect(screen.getByText("Subscription Successful!")).toBeInTheDocument();
        expect(
            screen.getByText("You'll be redirected to the login page shortly.")
        ).toBeInTheDocument();
    });

    it("redirects to login after 2 seconds", async () => {
        const pushMock = jest.fn();
        (nextNavigation.useRouter as jest.Mock).mockReturnValue({ push: pushMock });

        render(<SuccessPage />);
        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith("/login");
        });
    });
});