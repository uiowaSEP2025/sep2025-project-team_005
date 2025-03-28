"use client";

import { useState } from "react";
import styles from "@/styles/Login.module.css";
import { useAuth } from "@/context/ProfileContext";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login() {
  const { profile, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://savvy-note.com/api/auth/login/",      // Replace with an env variable for both local and Kubernetes deployment
        { username, password },
        { withCredentials: true } // Sends cookies to backend
      );

      try {
        if(!isLoading && profile)
          router.push(`/${username}`);
      } 
      catch (error) {
          console.error(error)
      }
    }
    catch (err) {
      setError("Invalid username or password");
    }
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