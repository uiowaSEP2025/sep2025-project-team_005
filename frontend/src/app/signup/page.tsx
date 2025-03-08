"use client";

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Signup() {
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [formError, setFormError] = useState("");
    const router = useRouter(); // Initialize the router

    // Function to validate password strength
    const validatePassword = (password: string): boolean => {
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/~`])[A-Za-z\d!@#$%^&*()_+{}[\]:;<>,.?/~`]{8,}$/;
                 
        if (!strongPasswordRegex.test(password)) {
            setPasswordError("Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.");
            return false;
        } 
        
        setPasswordError(""); // Clear the error if valid
        return true;
    };

    // Function to handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission if invalid

        // Check if all fields are filled
        if (!email || !username || !password || !role) {
            setFormError("All fields are required.");
            return;
        }

        // Validate password before submission
        if (!validatePassword(password)) {
            setFormError("Please fix the errors before submitting.");
            return;
        }

        // Clear form errors and then attempt API call
        setFormError("");

        try {
            const response = await axios.post(
                "http://18.117.105.40:8000/api/auth/signup/",
                {email, username, password, role},
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
            const data = await response.data;
    
            if (response.data.ok) {
                alert("Signup successful! Redirecting to login...");
                router.push("/login"); // Redirect to login page if successful
            } else {
                setFormError(data.email || data.username || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            setFormError("An error occurred. Please try again.");
        }

    };


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
                <h1 className={styles.title}>Sign Up</h1>
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
                    onChange={(e) => setEmail(e.target.value)}
                    // TODO SN5-81: use onBlur to make a validation call to backend for email uniqueness
                />

                <label htmlFor="username" className={styles.label}>Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    placeholder="Choose a username"
                    className={styles.inputField}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    // TODO SN5-81: use onBlur to make a validation call to backend for username uniqueness
                />

                <label htmlFor="password" className={styles.label}>Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    placeholder="Create a strong password"
                    className={styles.inputField}
                    value={password}
                    onChange={(e) => {setPassword(e.target.value);}}
                    // TODO SN5-81: Add UI for password strength
                />
                {passwordError && <p className={styles.error}>{passwordError}</p>}

                <label htmlFor="role" className={styles.label}>Select Role:</label>
                <select
                    id="role"
                    name="role"
                    required
                    className={styles.selectField}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="" disabled>Select your role</option>
                    <option value="musician">Musician</option>
                    <option value="business">Business</option>
                </select>

                {formError && <p className={styles.error}>{formError}</p>}

                <button type="submit" className={styles.submitButton}>Sign Up</button>
            </form>
        </div>
    );
}
