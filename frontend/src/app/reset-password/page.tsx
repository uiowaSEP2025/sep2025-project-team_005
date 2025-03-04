"use client";

// this is for entering the user email. Then it gets the user associated with this email, routes to ''_confirm.tsx, then has them put in the new password

// remember to include route back to login

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useState } from "react";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const validateEmail = (email: string): boolean => {
        return true;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setEmailError("Please enter an email.");
            return;
        }

        // Validate password before submission
        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email.");
            return;
        }

        // Clear form errors and then attempt API call
        setEmailError("");

        try {
            const response = await fetch("http://localhost:8000/api/auth/reset-password/", {       // Replace with an env variable for both local and Kubernetes deployment
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert("Check your email.");
            } else {
                setEmailError("Password reset failed. Please try again.");
            }
        } catch (error) {
            console.error("Reset error:", error);
            setEmailError("An error occurred. Please try again.");
        }
    };


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
                <h1 className={styles.title}>Enter Your Email</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <label htmlFor="email" className={styles.label}>Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    className={styles.inputField}
                    value={email}
                    onChange={(e) => {
                        const email = e.target.value;
                        if(validateEmail(email))
                        {
                            setEmail(email);
                        }
                    }}
                />
                {emailError && <p className={styles.error}>{emailError}</p>}

                <button type="submit" className={styles.submitButton}>Send Reset Password Email</button>
            </form>
        </div>
    );
}
