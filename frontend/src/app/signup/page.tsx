"use client"; 

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useState } from "react";

export default function Signup() {
    const [role, setRole] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [formError, setFormError] = useState("");

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
    const handleSubmit = (e: React.FormEvent) => {
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

        // Clear form errors and proceed with submission
        setFormError("");
        alert("Form submitted successfully!"); // Replace with actual submission logic
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
                <h1 className={styles.title}>Sign Up</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => {
                        const newPassword = e.target.value;
                        setPassword(newPassword);
                        validatePassword(newPassword);
                    }}
                />
                {passwordError && <p className={styles.error}>{passwordError}</p>}

                <label htmlFor="role">Select Role:</label>
                <select
                    id="role"
                    name="role"
                    required
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
