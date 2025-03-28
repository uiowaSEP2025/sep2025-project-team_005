"use client";

import { createContext, useContext } from "react";

// Mocked user data
const mockProfile = {
    id: 1,
    username: "testuser",
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    phone: "123-456-7890",
    role: "musician",
};

// Mock AuthContext
const AuthContext = createContext({
    profile: mockProfile,
    setProfile: jest.fn(),
    isLoading: false,
    fetchProfile: jest.fn(),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={{ profile: mockProfile, setProfile: jest.fn(), isLoading: false, fetchProfile: jest.fn() }}>
        {children}
    </AuthContext.Provider>
);

// Mock hooks
export const useAuth = () => useContext(AuthContext);
export const useRequireAuth = jest.fn(); // Ensures no redirect in tests
