"use client";

import { useAuth, useRequireAuth } from "@/context/ProfileContext"
import { useRouter } from "next/navigation";

import Cookies from "js-cookie";
import styles from "@/styles/Login.module.css";


export default function Profile() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading } = useAuth();






    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8000/api/auth/logout/", {
                method: "POST",
                credentials: "include",
            });

            // Clear stored token
            Cookies.remove("access_token");

            // Redirect to login page
            router.push("/login");
        } 
        catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }
    if (!profile) {
        return <p>Redirecting...</p>;
    }

    return (
      <div>
        Profile Page
        <h1>{profile.username}'s Profile</h1>
        <p>First Name: {profile.first_name}</p>
        <p>Last Name: {profile.last_name}</p>
        <p>Role: {profile.role}</p>
        <div>
            <button type="submit" className={styles.primaryButton} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
}