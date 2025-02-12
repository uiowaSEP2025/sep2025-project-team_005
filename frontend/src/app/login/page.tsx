import styles from "@/styles/Login.module.css";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.description}>Log in to connect, collaborate, and get paid.</p>
        <Image src="/savvy.png" alt="Platform Logo" width={150} height={150} className={styles.logo} />
      </header>

      <form className={styles.loginForm}>
        <input type="email" placeholder="Email" className={styles.inputField} required />
        <input type="password" placeholder="Password" className={styles.inputField} required />
        <button type="submit" className={styles.primaryButton}>Login</button>
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