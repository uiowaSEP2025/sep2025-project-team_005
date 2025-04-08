"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

export default function Home() { 
  const { toggleTheme, theme } = useTheme();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
        <h1 className={styles.title}>Connect, Collaborate, and Contract</h1>
        <p className={styles.description}>
          The ultimate platform for sharing your portfolio, finding gigs, and collaborate with other aspiring artists.
        </p>
        <div className={styles.buttonGroup}>
          <a id="loginButton" className={styles.primaryButton} href="/login">
            Login
          </a>
          <a id="signupButton" className={styles.secondaryButton} href="/signup">
            Get Started
          </a>
        </div>
        
        <main className={styles.features}>
          <div className={styles.featureCard}>
            <h2 className={styles.featureTitle}>Share Portfolios</h2>
            <p className={styles.featureText}>
              Showcase your recent gigs, projects, and performances with the community.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h2 className={styles.featureTitle}>Find New Gigs</h2>
            <p className={styles.featureText}>
              Discover performance opportunities, job listings, and collaboration requests in your area.
            </p>
          </div>
          <div className={styles.featureCard}>
            <h2 className={styles.featureTitle}>Secure Payments</h2>
            <p className={styles.featureText}>
              Receive contracted payments safely through our escrow system, ensuring trust and transparency with businesses.
            </p>
          </div>
        </main>
      </header>
      
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} SavvyNote. All rights reserved.
      </footer>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={styles.themeToggleButton}
        aria-label="Toggle Theme"
      >
        {theme === "light" ? <Moon size={26} /> : <Sun size={26} />}
      </button>
    </div>
  );
}