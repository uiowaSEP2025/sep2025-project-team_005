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
            // Get the access token from cookies (only works if HTTPOnly is False)
            const token = localStorage.getItem("access_token"); // Only works if stored in localStorage
    
            const response = await fetch("http://3.141.3.95:8000/api/auth/logout/", {
                method: "POST",
                credentials: "include",  // Ensures cookies are sent
            });
    
            if (response.ok) {
                router.push("/login");  // Redirect to login page after logout
            } else {
                console.error("Logout failed in frontend");
            }
        } catch (error) {
            console.error("Error logging out:", error);
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