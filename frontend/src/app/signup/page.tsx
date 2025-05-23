"use client";

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';

const SignUpSelection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");      // Get email from query parameter (if exists)

  const handleRoleSelection = (role: "musician" | "business") => {
    const path = `/signup/${role}`;

    // If an email was passed in query parameter, pass it to next sign up page as well
    if (email) {
        router.push(`${path}?email=${encodeURIComponent(email)}`);
    } else {
        router.push(path);
    }
  }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
            <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} /> 
            <h1 className={styles.title}>Sign Up</h1>
            </header>

        <p className={styles.subtitle}>Select your role:</p>

        <main className={styles.features}>
            <div className={styles.featureCard}>
                <h2 className={styles.featureTitle} onClick={() => handleRoleSelection("musician")} >Musician</h2>
                <p className={styles.featureText}>
                Promote your music, find gigs, and connect with industry professionals. Post updates, engage with 
                the community, and build your brand—your next opportunity is just a post away.
                </p>
            </div>
            <div className={styles.featureCard}>
                <h2 className={styles.featureTitle} onClick={() => handleRoleSelection("business")}>Business</h2>
                <p className={styles.featureText}>
                    Connect with talented musicians and grow your business. Whether you're a venue, recording studio, 
                    or talent agency, post opportunities and streamline hiring with our contract and escrow tools.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SignUpSelection;