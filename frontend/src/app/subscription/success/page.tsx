"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Optional: grab session_id from URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");

        // You could validate sessionId with your backend here

        // Redirect after 2 seconds
        const timeout = setTimeout(() => {
            router.push("/login");
        }, 2000);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div style={{ textAlign: "center", padding: "3rem" }}>
            <h1>Subscription Successful!</h1>
            <p>You'll be redirected to the login page shortly.</p>
        </div>
    );
}