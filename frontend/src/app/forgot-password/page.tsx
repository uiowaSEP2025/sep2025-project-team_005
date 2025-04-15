"use client";

import styles from "@/styles/Signup.module.css";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const BACKEND_API = process.env.BACKEND_API;

    const validateEmail = async (email: string): Promise<boolean> => {
        // TODO: add email regex validation
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setEmailError("Please enter an email.");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email.");
            return;
        }

        // Clear form errors and then attempt API call
        setEmailError("");
        const response = await axios.post(
            `http://${BACKEND_API}/api/auth/forgot-password/`, // Replace with an env variable
            { email },
            {
                headers: {
                "Content-Type": "application/json",
                },
            }
        );

        const data = await response.data;
        console.log("If an account with this email exists, a password reset link has been sent.")
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/login">
                    <button>Back to Login</button>
                </Link>
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
                    onChange={(e) => {setEmail(e.target.value);}}
                />
                {emailError && <p className={styles.error}>{emailError}</p>}

                <button type="submit" className={styles.submitButton}>Send Reset Password Email</button>
            </form>
        </div>
    );
}
