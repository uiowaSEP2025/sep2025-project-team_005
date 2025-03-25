"use client";

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
<<<<<<< HEAD
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const [uid, setUid] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
=======
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");
>>>>>>> Setup forgot password reset via email

    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [formError, setFormError] = useState("");
    const router = useRouter();

<<<<<<< HEAD
    useEffect(() => {
        setUid(searchParams.get("uid"));
        setToken(searchParams.get("token"));
    }, [searchParams]);

    if (!uid || !token) {
        return <div>Loading...</div>;
    }

=======
>>>>>>> Setup forgot password reset via email
    // Function to validate password strength
    const validatePassword = (password: string): boolean => {
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/~`])[A-Za-z\d!@#$%^&*()_+{}[\]:;<>,.?/~`]{8,}$/;
                 
        if (!strongPasswordRegex.test(password)) {
            setPasswordError("Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.");
            return false;
        }
        
        setPasswordError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            setFormError("Please reset your password.");
            return;
        }

        if (password != confirmedPassword) {
            setFormError("Please make sure your passwords match.")
        }

        // TODO SN5-81: add validation for if it matches old password

        // Validate password before submission
        if (!validatePassword(password)) {
            setFormError("Please fix the errors before submitting.");
            return;
        }

        // Clear form errors and then attempt API call
        setFormError("");

        try {
            const response = await fetch("http://localhost:8000/api/auth/reset-password/", {       // Replace with an env variable for both local and Kubernetes deployment
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, confirmedPassword, uid, token }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert("Password reset successful! Redirecting to login...");
                router.push("/login"); // Redirect to login page if successful
            } else {
                setFormError("Password reset failed. Please try again.");
            }
        } catch (error) {
            console.error("Reset error:", error);
            setFormError("An error occurred. Please try again.");
        }

    };


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
                <h1 className={styles.title}>Reset Password</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <label htmlFor="password" className={styles.label}>Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    placeholder="Create a strong password"
                    className={styles.inputField}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                    }}
                    // TODO SN5-81: Add UI for password strength
                />

                <label htmlFor="confirm password" className={styles.label}>Confirm Password:</label>
                <input
                    type="password"
                    id="password-confirmation"
                    name="confirm password"
                    required
                    placeholder="Retype your new password"
                    className={styles.inputField}
                    value={confirmedPassword}
                    onChange={(e) => {
                        const confirmedPassword = e.target.value;
                        setConfirmedPassword(confirmedPassword);
                    }}
                />
                {passwordError && <p className={styles.error}>{passwordError}</p>}

                <button type="submit" className={styles.submitButton}>Reset Password</button>
            </form>
        </div>
    );
}
<<<<<<< HEAD

const ResetPassword = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
    </Suspense>
);

export default ResetPassword;
=======
>>>>>>> Setup forgot password reset via email
