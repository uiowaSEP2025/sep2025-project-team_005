"use client"; 

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BusinessSignup() {
    const [error, setError] = useState("");
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [industry, setIndustry] = useState("");
    const searchParams = useSearchParams();     // Used to obtain email if passed from google login to role selection page to here

    useEffect(() => {
        // Get the email from the query parameter (if it exists)
        const email = searchParams.get("email");
        if (email) {
            // If an email was passed as a query parameter (google login -> sign up), set the email to pre-fill the email field
            setEmail(email);

            console.log(email);
        } else {
            console.log("No email passed");
        }
    }, [searchParams]);

    // On top of pre-existing HTML5 email validations, use regex to validate email on submission
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

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
        // Prevent page reload
        e.preventDefault();

        // Check that all fields have been filled out
        if (!email || !username || !password) {
            setError("Email, username, and password are required.")
            return;
        }

        // Double-check that email address is valid
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.")
            return;
        }

        // Validate strong password
        if (!validatePassword(password)) {
            setError("Please fix the password errors before submitting.")
            return;
        }

        // If these validations pass, clear the error message on screen
        setError("");

        const role = "business"
        const userData = {
            username: username,
            password: password,
            email: email,
            role: role,
            business_name: businessName,
            industry: industry
        }

        try {
            const response = await fetch("http://localhost:8000/api/auth/signup/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Response data: ", data);
                alert("Signup successful! Redirecting to login...");
                router.push("/login")
            } else {
                const errorData = await response.json();
                setError(errorData.email || errorData.username || "Signup failed. Please try again.")
            }
        }
        catch (error) {
            console.error("Signup error: ", error)
            setError("An error occurred. Please try again.")
        }
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
                    required 
                    placeholder="Enter your email"
                    className={styles.inputField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="username" className={styles.label}>Username:</label>
                <input
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

                <label htmlFor="businessname" className={styles.label}>Your Business' Name:</label>
                <input
                    id="businessname"
                    name="businessname"
                    required
                    placeholder="Business Name"
                    className={styles.inputField}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                />

                <label htmlFor="industry" className={styles.label}>Industry Your Business Is In:</label>
                <input
                    id="industry"
                    name="industry"
                    required
                    placeholder="Industry"
                    className={styles.inputField}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                />
            </form>

            {error && <p className={styles.error}>{error}</p>} {/* Show error if invalid */}
            <button type="submit" className={styles.businessSubmit} onClick={handleSubmit}>Sign Up</button>

        </div>
    );
}