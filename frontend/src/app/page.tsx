import Image from "next/image";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
        <h1 className={styles.title}>Connect, Collaborate, and Get Paid</h1>
        <p className={styles.description}>
          The ultimate platform for musicians to share updates, find gigs, and securely receive payments through our escrow system.
        </p>
      </header>

      <div className={styles.buttonGroup}>
        <a className={styles.primaryButton} href="/login">
          Login
        </a>
        <a className={styles.secondaryButton} href="/signup">
          Get Started
        </a>
      </div>
      
      <main className={styles.features}>
        <div className={styles.featureCard}>
          <h2 className={styles.featureTitle}>Post Updates</h2>
          <p className={styles.featureText}>
            Showcase your recent gigs, projects, and performances with the community.
          </p>
        </div>
        <div className={styles.featureCard}>
          <h2 className={styles.featureTitle}>Find New Gigs</h2>
          <p className={styles.featureText}>
            Discover performance opportunities, job listings, and collaboration requests.
          </p>
        </div>
        <div className={styles.featureCard}>
          <h2 className={styles.featureTitle}>Secure Payments</h2>
          <p className={styles.featureText}>
            Receive payments safely through our escrow system, ensuring trust and transparency.
          </p>
        </div>
      </main>
      
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} SavvyNote. All rights reserved.
      </footer>
    </div>
  );
}