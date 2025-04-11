import styles from "@/styles/Subscription.module.css";

import React from "react";

export default function Subscription() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
            <h1 className={styles.title}>Upgrade Your Account</h1>
            <p className={styles.description}>
                Unlock powerful tools to grow your network, manage gigs, and collaborate with ease.
            </p>
            </div>

            <div className={styles.features}>
            {/* Monthly Plan */}
            <div className={styles.featureCard}>
                <h2 className={styles.featureTitle}>Monthly Plan</h2>
                <p className={styles.featureText} style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                    $20 / month
                </p>
                <ul className={styles.featureList}>
                <li className={styles.featureListItem}>✓ Post unlimited job listings</li>
                <li className={styles.featureListItem}>✓ Manage all incoming applications</li>
                <li className={styles.featureListItem}>✓ Contact applicants directly in-app</li>
                </ul>
                <a href="/signup?plan=monthly" className={styles.primaryButton}>Choose Monthly</a>
            </div>

            {/* Annual Plan */}
            <div
                className={styles.featureCard}
                style={{ background: "linear-gradient(135deg, #6d28d9, #3b82f6)" }}
            >
                <h2 className={styles.featureTitle}>Annual Plan</h2>
                <p className={styles.featureText} style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                    $200 / year
                </p>
                <p className={styles.featureText} style={{ fontSize: "1.25rem", marginTop: "-0.5rem", color: "#d1d5db" }}>
                    Save $40 annually!
                </p>
                <ul className={styles.featureList}>
                    <li className={styles.featureListItem}>✓ Everything in Monthly</li>
                    <li className={styles.featureListItem}>✓ Priority support</li>
                    <li className={styles.featureListItem}>✓ Early access to new features</li>
                </ul>
                <a href="/signup?plan=annual" className={styles.primaryButton}>Choose Annual</a>
            </div>
            </div>

            <div className={styles.footer}>
                <p>No commitment. Cancel anytime.</p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", opacity: 0.6 }}>
                    © 2025 MusicMatch Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
};
