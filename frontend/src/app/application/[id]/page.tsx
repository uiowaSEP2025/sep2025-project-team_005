"use client";

import React from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import styles from "@/styles/Application.module.css";

interface JobListing {
    id: number;
    business: { id: number; business_name: string };
    event_title: string;
    venue: string;
    event_description: string;
    gig_type: string;
    payment_type: string;
    payment_amount: string;
    created_at: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    recurring_pattern: string;
    experience_level: string;
    instruments: { id: number; instrument: string }[];
    genres: { id: number; genre: string }[];
}

export default function JobListing() {
    useRequireAuth();

    const router = useRouter();
    const { id } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [jobListing, setJobListing] = useState<JobListing>();
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [altEmail, setAltEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    useEffect(() => {
            const fetchJobListing = async () => {

            setLoading(true);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/fetch-job/`, {
                    params: {
                        listing_id: id,
                    },
                    withCredentials: true,
                });

                setJobListing(response.data);
                console.log(response.data);

            } catch (error) {
                console.error("Failed to fetch job listing", error);
            } finally {
                setLoading(false);
            }
        }

        fetchJobListing();
    }, [id]);

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split("-");
        return `${month}-${day}-${year}`;
    };

    const formatTime = (timeStr: string) => {
        const [hour, minute] = timeStr.split(":").map(Number);
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
    };

    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, ""); // Remove all non-numeric characters
        if (cleaned.length <= 3) return `(${cleaned}`;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)})${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append("first_name", firstName);
        formData.append("last_name", lastName);
        formData.append("email", email);
        formData.append("alt_email", altEmail);
        formData.append("phone", phone);
        if (resumeFile) {
            formData.append("resume", resumeFile);
        }
        formData.append("status", "In-Progress")

        if (jobListing?.id) {
            formData.append("job_listing", String(jobListing.id));
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/submit-application/`, formData, {
                headers: {
                    "Authorization": `Bearer ${Cookies.get("access_token")}`,
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            alert("Application submitted!");

            const app_id = response.data.application_id;
            router.push(`/application/${id}/${app_id}`);
        } catch (err) {
            console.error("Submission error:", err);
            alert("There was an error submitting your application.");
        }
    };    

    if (loading || !jobListing || !profile) { return <div>Loading...</div>; }

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <h2 className={styles.featureTitle}>Submit Your Application</h2>
                </div>
                <div className={styles.jobCard}>
                    <div className={styles.header}>
                    <h3 className={styles.jobTitle}>{jobListing.event_title}</h3>
                    <span className={styles.businessName}>{jobListing.business.business_name}</span>
                    <div>
                        <span className={styles.venue}>{jobListing.venue}</span>
                    </div>
                    </div>

                    <div className={styles.metaRow}>
                    {jobListing.payment_amount && (
                        <span className={styles.payment}>
                        ${parseFloat(jobListing.payment_amount).toFixed(2)}
                        {jobListing.payment_type === "Hourly rate" && " an hour"}
                        </span>
                    )}
                    <span className={styles.gigType}>{jobListing.gig_type}</span>
                    {jobListing.experience_level && (
                        <span className={styles.experience}>{jobListing.experience_level}</span>
                    )}
                    </div>

                    <div className={styles.dateRow}>
                    <span>
                        {formatDate(jobListing.start_date)} {jobListing.start_time && `@ ${formatTime(jobListing.start_time)}`}
                        {jobListing.end_date && ` - ${formatDate(jobListing.end_date)} ${jobListing.end_time ? `@ ${formatTime(jobListing.end_time)}` : ""}`}
                    </span>
                    {jobListing.recurring_pattern && <span> • {jobListing.recurring_pattern}</span>}
                    </div>

                    <p className={styles.descriptionJob}>
                    {jobListing.event_description.length > 140
                        ? jobListing.event_description.slice(0, 140) + "..."
                        : jobListing.event_description}
                    </p>

                    <div className={styles.tags}>
                    {jobListing.instruments.map((inst, i) => (
                        <span key={`inst-${i}`} className={styles.tag}>{inst.instrument}</span>
                    ))}
                    {jobListing.genres.map((g, i) => (
                        <span key={`genre-${i}`} className={styles.tag}>{g.genre}</span>
                    ))}
                    </div>
                </div>
                <div className={styles.pageHeader}>
                    <h2 className={styles.featureTitle}>Personal Information</h2>
                </div>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            placeholder={profile.email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                            readOnly
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Alternative Email (optional)</label>
                        <input
                            type="email"
                            value={altEmail}
                            onChange={(e) => setAltEmail(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Phone</label>
                        <input
                            type="tel"
                            value={formatPhoneNumber(phone)}
                            onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhone(digitsOnly);
                            }}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Upload Resume (PDF)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setResumeFile(e.target.files[0]);
                                }
                            }}
                            className={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Next
                    </button>
                </form>
            </div>
        </div>
    )
}