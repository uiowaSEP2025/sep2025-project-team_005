"use client";

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Head from "next/head";

const SignUpSelection = () => {
    const router = useRouter();

    return (
        <>
            <Head>
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            </Head>
            <div className={styles.container}>
                <header className={styles.header}>
                <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} /> 
                <h1 className={styles.title}>Sign Up</h1>
                </header>

                <p className={styles.subtitle}>Select your role:</p>
                <main className={styles.features}>
                    <div className={styles.featureCard} onClick={() => router.push('/signup/musician')}>
                        <h2 className={styles.featureTitle}>Musician</h2>
                        <p className={styles.featureText}>
                        Promote your music, find gigs, and connect with industry professionals. Post updates, engage with 
                        the community, and build your brand—your next opportunity is just a post away.
                        </p>
                    </div>
                    <div className={styles.featureCard} onClick={() => router.push('/signup/business')}>
                        <h2 className={styles.featureTitle}>Business</h2>
                        <p className={styles.featureText}>
                        Connect with talented musicians and grow your business. Whether you're a venue, recording studio, 
                        or talent agency, post opportunities and streamline hiring with our contract and escrow tools.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
};

export default SignUpSelection;