"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import Toolbar from '@/components/toolbars/toolbar';

import styles from "@/styles/Profile.module.css";
import axios from "axios";


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

interface BusinessUser {
    id: string;
    username: string;
}

export default function JobListingFeed() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading, setProfile } = useAuth();
    const [jobListings, setJobListings] = useState<JobListing[]>([]);
    const [user, setUser] = useState<BusinessUser>();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchJobListings = async (pageNum = 1) => {

        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/fetch-all-jobs/`, {
                params: {
                    page: pageNum,
                },
                withCredentials: true,
            });

            if (pageNum === 1) {
                setJobListings(response.data.results);
                console.log(response.data.results)
            } else {
                setJobListings((prevListings) => [...prevListings, ...response.data.results]);
            }

            setHasMore(response.data.next !== null);
        } catch (error) {
            console.error("Failed to fetch job listings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (listing: JobListing) => {
        try {
            router.push(`/application/${listing.id}`)
        } catch (error) {
            console.error(error)
        }
    }

    const navigateBusiness = async (listing: JobListing) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/user-from-business/${listing.business.id}/`, {
                withCredentials: true,
            });

            setUser(response.data)
            if (user)
                router.push(`/${user.username}/business`)
        }
        catch (error) {
            console.error("Failed to fetch job listings", error);
        }
    }

    useEffect(() => {
        setJobListings([]);
        setPage(1);
        fetchJobListings(1);
    }, []);

    const loadMoreJobListings = () => {
        if (hasMore && !loading) {
            fetchJobListings(page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

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

    if (isLoading) return <p className="description">Loading...</p>;

    return (
        <div>
            <Toolbar />
            <div className={styles.container}>
                <div className={styles.postsSection}>
                    <div className={styles.postsHeader}>
                        <h2 className={styles.featureTitle}>Job Listings</h2>
                    </div>

                    {jobListings.map((listing, index) => (
                    <div
                        key={listing.id || index}
                        className={styles.jobCard}
                    >
                        <div className={styles.header}>
                        <h3 className={styles.jobTitle}>{listing.event_title}</h3>
                        <button
                            className={styles.businessName}
                            onClick={() => navigateBusiness(listing)}
                        >
                            {listing.business.business_name}
                        </button>
                        <div>
                            <span className={styles.venue}>{listing.venue}</span>
                        </div>
                        </div>

                        <div className={styles.metaRow}>
                        {listing.payment_amount && (
                            <span className={styles.payment}>
                            ${parseFloat(listing.payment_amount).toFixed(2)}
                            {listing.payment_type === "Hourly rate" && " an hour"}
                            </span>
                        )}
                        <span className={styles.gigType}>{listing.gig_type}</span>
                        {listing.experience_level && (
                            <span className={styles.experience}>{listing.experience_level}</span>
                        )}
                        </div>

                        <div className={styles.dateRow}>
                        <span>
                            {formatDate(listing.start_date)} {listing.start_time && `@ ${formatTime(listing.start_time)}`}
                            {listing.end_date && ` - ${formatDate(listing.end_date)} ${listing.end_time ? `@ ${formatTime(listing.end_time)}` : ""}`}
                        </span>
                        {listing.recurring_pattern && <span> • {listing.recurring_pattern}</span>}
                        </div>

                        <p className={styles.descriptionJob}>
                        {listing.event_description.length > 140
                            ? listing.event_description.slice(0, 140) + "..."
                            : listing.event_description}
                        </p>

                        <div className={styles.tags}>
                        {listing.instruments.map((inst, i) => (
                            <span key={`inst-${i}`} className={styles.tag}>{inst.instrument}</span>
                        ))}
                        {listing.genres.map((g, i) => (
                            <span key={`genre-${i}`} className={styles.tag}>{g.genre}</span>
                        ))}
                        </div>

                        {profile?.role == "musician" && (
                        <div className={styles.cardActions}>
                            <button className={styles.viewApplicantsButton} onClick={(e) => {
                                e.stopPropagation();
                                handleApply(listing);
                            }}>
                            Apply
                            </button>
                        </div>
                        )}
                    </div>
                    ))}

                    {hasMore && !loading && (
                    <button onClick={loadMoreJobListings} className={styles.loadMoreButton}>
                        Load More
                    </button>
                    )}

                    {loading && <p>Loading...</p>}
                </div>
            </div>
        </div>
    );
}