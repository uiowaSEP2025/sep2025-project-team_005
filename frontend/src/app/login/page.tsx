"use client";

import { useState } from "react";
import styles from "@/styles/Login.module.css";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/login/",
        { email, password },
        { withCredentials: true } // Sends cookies to backend
      );

      Cookies.set("access_token", response.data.access, { secure: true, sameSite: "Lax" });
      router.push("/"); // Redirect after login
    } 
    catch (err) {
      setError("Invalid email or password");
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
        <input type="email" placeholder="Email" className={styles.inputField} value={email} 
          onChange={(e)=> setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className={styles.inputField} value={password} 
          onChange={(e) => setPassword(e.target.value)} required />
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