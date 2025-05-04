"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

import styles from "@/styles/Application.module.css";


type Application = {
  id: string;
  applicant: { id: number; username: string, email: string };
  first_name: string;
  last_name: string;
  phone: string;
  alt_email: string | null;
  file_keys: string[];
  status: string;
};

export default function ViewApplications() {

    useRequireAuth();

    const router = useRouter();
    const { id } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        const fetchApplications = async () => {
        try {
            const token = Cookies.get("access_token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/applications/listing/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
            });
            setApplications(response.data);

            console.log(response.data)
        } catch (err) {
            console.error("Failed to fetch applications", err);
        }
        };

        if (id) fetchApplications();
    }, [id]);

    const updateApplicationStatus = async (app_id: string, status: string) => {
        try {
            const token = Cookies.get("access_token");
            await axios.patch(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/api/applications/${app_id}/`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        
            setApplications((prev) =>
                prev.map((app) =>
                app.id === app_id ? { ...app, status } : app
                )
            );
        } catch (err) {
          console.error("Failed to update application status", err);
        }
    };

    const sendContract = async (email: string, name: string) => {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/docusign/send-contract/`, {
          email,
          name,
        });

        return response.data.envelope_id;
      };

    if (!profile) { return <div>Loading...</div>; }

    return (
        <div className={styles.applicationsContainer}>
            <h1 className={styles.applicationsTitle}>Applications for Job #{id}</h1>
            <div className="grid gap-4">
                {applications.map((app) => (
                <div key={app.id} className={styles.applicationCard}>
                    <div className={styles.applicationInfo}>
                        <h2>{app.first_name} {app.last_name}</h2>
                        <p>Phone: {app.phone}</p>
                        <p>Email: {app.alt_email || "N/A"}</p>
                        <p>Status: {app.status}</p>
                        </div>
                        <div className={styles.applicationActions}>
                        {app.file_keys.length > 0 ? (
                            <a
                            href={`https://your-s3-bucket.s3.amazonaws.com/${app.file_keys[0]}`}
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
                                onClick={async () => {
                                  await updateApplicationStatus(app.id, "Accepted");
                                  if (app.alt_email && app.first_name) {
                                    try {
                                      const envelopeId = await sendContract(app.alt_email, app.first_name);
                                      alert(`Contract sent! Envelope ID: ${envelopeId}`);
                                    } catch (err) {
                                      console.error("Failed to send contract", err);
                                      alert("Contract sending failed");
                                    }
                                  }
                                }}
                            >
                            Accept
                            </button>
                            <button
                                className={styles.rejectButton}
                                onClick={() => updateApplicationStatus(app.id, "Rejected")}
                            >
                            Reject
                            </button>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}
    