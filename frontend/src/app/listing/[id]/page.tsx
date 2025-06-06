"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useParams } from "next/navigation";
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
  applicant: {id: string, username:string, email:string};
  first_name: string;
  last_name: string;
  phone: string;
  alt_email: string | null;
  file_urls: string[];
  status: string;
  experiences: Experience[];
};

export default function ViewApplications() {

    useRequireAuth();

    const router = useRouter();
    const { id } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    

    const fetchApplications = async (pageNum = 1) => {
        try {
            const token = Cookies.get("access_token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/applications/listing/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: pageNum
                },
            });

            if (pageNum === 1) {
                setApplications(response.data.results);
            } else {
                setApplications((prevApps) => [...prevApps, ...response.data.results]);
            }

            setHasMore(response.data.next !== null);
        } catch (err: any) {
            if (err.response?.status === 404) {
                // No more pages
                setHasMore(false);
            } else {
                console.error("Failed to fetch applications", err);
            }
        }
        finally {
            setLoading(false);
        }
    };

    const handleAccept = async (appId: string, applicantEmail: string) => {
    
        try {
            const token = Cookies.get("access_token");
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/send-acceptance-email/`,
                { 
                    application_id: appId,
                    app_email: applicantEmail,
                 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Acceptance email sent.");

            updateApplicationStatus(appId, "Accepted")
        } catch (err) {
            console.error("Failed to send acceptance email", err);
        }
    };

    const handleReject = async (appId: string, applicantEmail: string) => {
    
        try {
            const token = Cookies.get("access_token");
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/send-reject-email/`,
                { 
                    application_id: appId,
                    app_email: applicantEmail,
                 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Rejection email sent.");

            updateApplicationStatus(appId, "Rejected")
        } catch (err) {
            console.error("Failed to send rejection email", err);
        }
    };

    const updateApplicationStatus = async (appId: string, status: string) => {
        try {
            const token = Cookies.get("access_token");
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/patch-application/${appId}/`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        
            setApplications((prev) =>
                prev.map((app) =>
                app.id === appId ? { ...app, status } : app
                )
            );
        } catch (err) {
          console.error("Failed to update application status", err);
        }
    };

    useEffect(() => {
            setPage(1);
            fetchApplications(1);
    }, [id]);

    const loadMoreApps = () => {
        if (hasMore && !loading) {
            fetchApplications(page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

    if (!profile) { return <div>Loading...</div>; }

    return (
        <div className={styles.applicationsContainer}>
            <button
                onClick={() => router.back()}
                className={styles.backButton}
            >
                ← Back
            </button>
            <h1 className={styles.applicationsTitle}>Applications for Job #{id}</h1>
            <div className="grid gap-4">
                {applications.filter((app) => app.status !== "In-Progress").map((app) => (
                    <div key={app.id} className={styles.applicationCard}>
                    <div className={styles.header}>
                        <h2 className={styles.jobTitle}>{app.first_name} {app.last_name}</h2>
                        <p className={styles.venue}><strong>Phone:</strong>  {app.phone}</p>
                        <p className={styles.venue}><strong>Email:</strong>  {app.applicant.email || "N/A"}</p>
                        <p className={styles.venue}><strong>Alt Email:</strong>  {app.alt_email || "N/A"}</p>
                        <p className={styles.venue}><strong>Status:</strong>  {app.status}</p>
            
                        {app.experiences && app.experiences.length > 0 && (
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
                        <div className={styles.applicationActions}>
                        {app.file_urls.length > 0 ? (
                            <a
                            href={`${app.file_urls[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.resumeButton}
                            >
                            View Resume
                            </a>
                        ) : (
                            <span className={styles.noResumeText}>No resume</span>
                        )}
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.acceptButton}
                                onClick={() => handleAccept(app.id, app.alt_email || app.applicant.email)}
                            >
                            Accept
                            </button>
                            <button
                                className={styles.rejectButton}
                                onClick={() => handleReject(app.id, app.alt_email || app.applicant.email)}
                            >
                            Reject
                            </button>
                        </div>
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
    