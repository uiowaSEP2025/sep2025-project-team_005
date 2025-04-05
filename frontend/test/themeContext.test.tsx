import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { ReactNode } from "react";
import { act } from "react-dom/test-utils";

// Mock localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === "theme") return "light";
    return null;
  });
  Storage.prototype.setItem = jest.fn();
});

describe("ThemeProvider", () => {
  it("provides the default theme from localStorage", () => {
    let receivedTheme: string | null = null;

    const TestComponent = () => {
      const { theme } = useTheme();
      receivedTheme = theme;
      return <div>{theme}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(receivedTheme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles the theme correctly", () => {
    let toggleTheme: () => void;
    let receivedTheme: string | null = null;

    const TestComponent = () => {
      const context = useTheme();
      toggleTheme = context.toggleTheme;
      receivedTheme = context.theme;
      return <div>{context.theme}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(receivedTheme).toBe("light");

    act(() => {
      toggleTheme();
    });

    expect(receivedTheme).toBe("dark");
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("throws an error if useTheme is used outside ThemeProvider", () => {
    const TestComponent = () => {
      useTheme();
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
  });

  it("renders children properly", () => {
    render(
      <ThemeProvider>
        <p>Test Child</p>
      </ThemeProvider>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });
});
