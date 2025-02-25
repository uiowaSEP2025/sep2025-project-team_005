"use client";

import styles from "@/styles/Login.module.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";


export default function Profile() {
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        const accessToken = Cookies.get("access_token");
        if (!accessToken) {
            router.push("/");
        }
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8000/api/auth/logout/", {
                method: "POST",
                credentials: "include",
            });
    
            // Clear frontend state
            localStorage.removeItem("user"); 
            window.location.href = "/login"; // Redirect to login page
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
      <div>
        Profile Page
        <div>
            <button type="submit" className={styles.primaryButton} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
}