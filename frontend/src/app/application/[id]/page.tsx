"use client";

import React from 'react';
import { Edit } from 'lucide-react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import axios from "axios";

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
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({
            firstName,
            lastName,
            email,
            phone,
        });
    };

    if (loading || !jobListing) { return <div>Loading...</div>; }

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
                <form onSubmit={handleSubmit} className={styles.formContainer}>
                    <div className={styles.formGroup}>
                        <label>First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={styles.formInput}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Submit Application
                    </button>
                </form>
            </div>
        </div>
    )
}