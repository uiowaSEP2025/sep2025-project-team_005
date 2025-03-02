"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface UserProfile {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface AuthContextType {
    profile: UserProfile | null;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
    isLoading: boolean;
    fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = async () => {
        setIsLoading(true);
        const accessToken = Cookies.get("access_token");
        if (!accessToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get<UserProfile>("http://3.141.3.95:8000/api/auth/profile/", {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true,
            });

            setProfile(response.data);
        } 
        catch (error: any) {
            console.error("Error fetching profile:", error);
        
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    router.push("/");
                }
            } 
            else {
                console.error("Unexpected error:", error);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <AuthContext.Provider value={{ profile, setProfile, isLoading, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const useRequireAuth = () => {
    const { profile, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !profile) {
            router.push("/");
        }
    }, [profile, isLoading, router]);
};