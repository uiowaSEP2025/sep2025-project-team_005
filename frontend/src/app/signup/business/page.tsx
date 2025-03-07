// Sign up page for business accounts

"use client"; 

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessSignup() {
    const [error, setError] = useState("");
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

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

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("In handleSubmit function")
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
                <h1 className={styles.title}>Sign Up: Business</h1>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="email" className={styles.label}>Email:</label>
                <input
                    type="email"    // HTML5 pre-enforced validation for email
                    id="email"
                    name="email"
                    required        // Require field to be filled out upon submission
                    placeholder="Enter your email"
                    className={styles.inputField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => {
                        const newPassword = e.target.value;
                        setPassword(newPassword);
                        validatePassword(newPassword);
                    }}
                />
                {passwordError && <p className={styles.error}>{passwordError}</p>}
            </form>

            {error && <p className={styles.error}>{error}</p>} {/* Show error if invalid */}
            <button type="submit" className={styles.submitButton}>Sign Up</button>

        </div>
    );
}