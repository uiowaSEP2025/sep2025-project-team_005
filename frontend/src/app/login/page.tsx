"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/Login.module.css";
import { useAuth } from "@/context/ProfileContext";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const { profile, isLoading, fetchProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loggingIn, setLoggingIn] = useState(false);
  const NEXT_PUBLIC_BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/login/`,
        { username, password },
        { withCredentials: true } // Sends cookies to backend
      );
      await fetchProfile();

    }
    catch (err) {
      setError("Invalid username or password");
    }
  };

  useEffect(() => {
    if (!isLoading && profile && loggingIn) {
      setLoggingIn(false);
      if(profile.role == "musician")
        router.push(`/${profile.username}`);
      else 
        router.push(`/${profile.username}/business`);
    }
  }, [profile, isLoading, router]);

  // Function to handle clicking login with google button
  const handleGoogleLogin = () => {
    // Call next-auth sign in function with the provider (google) and callback URL
    signIn("google", { callbackUrl: "/google-auth" });
  };

  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.description}>Log in to connect, collaborate, and get paid.</p>
        <Image src="/savvy.png" alt="Platform Logo" width={150} height={150} className={styles.logo} />
      </header>

      <form className={styles.loginForm} onSubmit={handleLogin}>
        <input type="username" placeholder="Username" className={styles.inputField} value={username} 
          onChange={(e)=> setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" className={styles.inputField} value={password} 
          onChange={(e) => setPassword(e.target.value)} required />
        <div className={styles.forgotPasswordContainer}>
          <Link href="/forgot-password" className={styles.link}>Forgot Password?</Link>
        </div>
        <button type="submit" className={styles.primaryButton}>Login</button>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.altOption}>
          Don't have an account? <Link href="/signup" className={styles.link}>Sign Up</Link>
        </p>
      </form>

      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} SavvyNote. All rights reserved.
      </footer>
    </div>
  );
}