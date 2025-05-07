"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/context/ProfileContext";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "@/styles/Application.module.css";

type Experience = {
    job_title: string;
    company_name: string;
    start_date: string;
    end_date: string;
    description: string;
};

type Application = {
    id: string;
    listing: {id: string, event_title: string};
    first_name: string;
    last_name: string;
    phone: string;
    alt_email: string | null;
    file_urls: string[];
    status: string;
    experiences: Experience[];
};

export default function MyApplications() {
    useRequireAuth();
    const router = useRouter();

    const [applications, setApplications] = useState<Application[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const fetchApplications = async (pageNum = 1) => {
        try {
        const token = Cookies.get("access_token");
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/applications/user/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: pageNum },
        });

        if (pageNum === 1) {
            setApplications(response.data.results);
        } else {
            setApplications((prev) => [...prev, ...response.data.results]);
        }

        setHasMore(response.data.next !== null);
        } catch (err) {
        console.error("Failed to fetch user applications", err);
        setHasMore(false);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications(1);
    }, []);

    const loadMoreApps = () => {
        if (hasMore && !loading) {
        fetchApplications(page + 1);
        setPage((prev) => prev + 1);
        }
    };

    return (
        <div className={styles.applicationsContainer}>
        <button onClick={() => router.back()} className={styles.backButton}>
            ← Back
        </button>
        <h1 className={styles.applicationsTitle}>My Applications</h1>
        <div className="grid gap-4">
            {applications.map((app) => (
            <div key={app.id} className={styles.applicationCard}>
                <div className={styles.header}>
                <h2 className={styles.jobTitle}>{app.listing.event_title}</h2>
                <p className={styles.venue}><strong>Status:</strong> {app.status}</p>
                <p className={styles.venue}><strong>Submitted as:</strong> {app.first_name} {app.last_name}</p>
                <p className={styles.venue}><strong>Phone:</strong> {app.phone}</p>
                <p className={styles.venue}><strong>Alt Email:</strong> {app.alt_email || "N/A"}</p>
                {app.status === "In-Progress" && (
                <button
                    className={styles.finishButton}
                    onClick={() => router.push(`/application/${app.listing.id}/${app.id}`)}
                >
                    Finish Application
                </button>
                )}

                {app.experiences?.length > 0 && (
                    <div className={styles.experienceSection}>
                    <h3 className={styles.jobTitle}>Experience</h3>
                    {app.experiences.map((exp, i) => (
                        <div key={i} className={styles.expCard}>
                        <p className={styles.venue}><strong>{exp.job_title}</strong> at {exp.company_name}</p>
                        <p className={styles.venue}>{exp.start_date} – {exp.end_date}</p>
                        <p className={styles.venue}>{exp.description}</p>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>
            ))}
            {hasMore && (
            <button onClick={loadMoreApps} disabled={loading}>
                Load More
            </button>
            )}
        </div>
        </div>
    );
}