"use client";

import React from 'react';
import { Edit } from 'lucide-react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import Image from "next/image";
import Toolbar from '@/components/toolbars/toolbar';

import styles from "@/styles/Profile.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import Dropdown from '@/components/menus/dropdown';
import { Button, styled } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface UserID {
    user_id: string;
}

interface BusinessProfile {
    business_name: string;
    industry: number;
}

interface FollowCount {
    follower_count: number;
    following_count: number;
}

interface JobListing {
    id: number;
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

export default function BusinessProfile() {
    useRequireAuth();

    const router = useRouter();
    const { username } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [followCount, setFollowCount] = useState<FollowCount | null>(null);
    const [userId, setUserId] = useState<UserID | null>(null);
    const [jobListings, setJobListings] = useState<JobListing[]>([]);
    const [files, setFiles] = useState<File[]>();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            if (!username) return; // Ensure username is available

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/user/${username}/`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserId(data);
                } else {
                    console.error("Failed to fetch user ID", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching user ID:", error);
            }
        };

        fetchUserId();
    }, [username]);

    // Fetch business Profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId || !profile) return;
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/business/${userId.user_id}/`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("access_token")}`
                    }
                });

                if (response.status === 403) {
                    alert("The page you are trying to access doesn't axist");
                    router.push(`/${profile.username}/`);
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setBusinessProfile(data);
                } else {
                    console.error("Failed to fetch business profile", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching business profile:", error);
            }
        };

        fetchProfile();
    }, [userId]);

    // Fetch Follow Count
    useEffect(() => {
        const fetchFollowCount = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/follower/${userId.user_id}/`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setFollowCount(data);
                } else {
                    console.error("Failed to fetch follow count", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching follow count:", error);
            }
        };

        fetchFollowCount();
    }, [userId]);

    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!userId || !profile || userId.user_id === String(profile.id)) return;
    
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/is-following/${userId.user_id}/`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("access_token")}`
                    }
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setIsFollowing(data.is_following);
                } else {
                    console.error("Failed to fetch follow status");
                }
            } catch (error) {
                console.error("Error fetching follow status:", error);
            }
        };
    
        fetchFollowStatus();
    }, [userId, profile]);    
    
    const handleFollowToggle = async () => {
        if (!userId) return;
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/follow/${userId.user_id}/`, {
                method: isFollowing ? "DELETE" : "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${Cookies.get("access_token")}`
                }
            });
    
            if (response.ok) {
                setIsFollowing(prev => !prev);
                setFollowCount(prev => prev ? {
                    ...prev,
                    follower_count: prev.follower_count + (isFollowing ? -1 : 1)
                } : prev);
            } else {
                console.error("Failed to toggle follow status");
            }
        } catch (error) {
            console.error("Error toggling follow status:", error);
        }
    };    

    const handleUpdateProfile = async () =>  {
        try {
            router.push("/settings/business");
        } catch (error) {
            console.error(error)
        }
    }

    const handleSettings = async () => {
        try {
            router.push("/settings");
        } catch (error) {
            console.error(error)
        }
    }

    const handleViewApplicants = async (listing: number) => {
        try {
            router.push("/");
        } catch (error) {
            console.error(error)
        }
    }

    const handleEditJob = async (listing: number) => {
        try {
            router.push("/");
        } catch (error) {
            console.error(error)
        }
    }

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/auth/logout/`, {
                credentials: "include",
            });

            // Clear stored token
            Cookies.remove("access_token");

            // Clear user profile data
            setProfile(null);


            // Redirect to login page
            router.push("/login");
        } 
        catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleBlockUser = async () => {
        if (!userId) return;
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/block/${userId.user_id}/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${Cookies.get("access_token")}`,
                },
            });
    
            if (response.ok) {
                alert("User blocked.");
            } else {
                console.error("Failed to block user.");
            }
        } catch (error) {
            console.error("Error blocking user:", error);
        }
    };    

    const handleNewJobListing = async () => {
        router.push(`/${username}/create-listing`);
    };

    const handleNavigation = (user_id: string, type: "followers" | "following") => {
        router.push(`/follow/${user_id}?type=${type}`);
    };

    const fetchJobListings = async (pageNum = 1) => {
        if(!userId) return;

        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/fetch-jobs/`, {
                params: {
                    user_id: userId?.user_id,
                    page: pageNum,
                },
                withCredentials: true,
            });

            if (pageNum === 1) {
                setJobListings(response.data.results);
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
    
    useEffect(() => {
        setPage(1);
        fetchJobListings(1);
    }, [userId?.user_id]);

    const handleJobListingClick = async (listing: JobListing) => {
        router.push(`/listings/${listing.id}`)
    }

    useEffect(() => {
        setJobListings([]);
        setPage(1);
        fetchJobListings(1);
    }, [userId?.user_id]);

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

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    if (isLoading || !businessProfile || !followCount) return <p className="description">Loading...</p>;

    return (
        <div>
            <Toolbar />
            <div className={styles.container}>
                <div className={styles.profileHeader}>
                    <Image 
                        src="/savvy.png" 
                        alt={`${username}'s profile picture`} 
                        width={130} 
                        height={130} 
                        className={styles.profilePhoto}
                    />
                    <div className={styles.profileInfo}>
                        <div className={styles.headerWithDots}>
                            <h1 className={styles.title}>{username}</h1>
                            <Dropdown 
                                buttonLabel={<FaEllipsisV size={24} />} 
                                data-testid="dropdown-button"
                                sx={{ 
                                    position: 'absolute', 
                                    right: 0, 
                                    cursor: 'pointer', 
                                }}
                                menuItems={[
                                    profile?.username === username ? { label: "Settings", onClick: handleSettings } : null,
                                    profile?.username === username ? { label: "Logout", onClick: handleLogout } : null,
                                    profile?.username !== username ? { label: "Block User", onClick: handleBlockUser } : null,
                                ]}
                            >
                            </Dropdown>
                        </div>

                        <div className={styles.followStats}>
                            <div className={styles.statCard}>
                                <button className={styles.statNumber} onClick={() => userId && handleNavigation(userId.user_id, "followers")}>{followCount.follower_count}</button>
                                <p className={styles.statLabel}>Followers</p>
                            </div>
                            <div className={styles.statCard}>
                            <button className={styles.statNumber} onClick={() => userId && handleNavigation(userId.user_id, "following")}>{followCount.following_count}</button>
                                <p className={styles.statLabel}>Following</p>
                            </div>
                        </div>
                        {profile?.username !== username && isFollowing !== null && (
                            <div className={styles.profileActions}>
                            <button 
                                className={isFollowing ? styles.unfollowButton : styles.followButton}
                                onClick={handleFollowToggle}
                                data-testid="follow-button"
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button>                                
                            <button className={styles.messageButton} data-testid="message-button">Message</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.bioSection}>
                    {profile?.username === username && (
                        <button className={styles.editButton} onClick={handleUpdateProfile} data-testid="edit-button"><Edit size={24}/></button>
                    )}
                    <h2 className={styles.bioTitle}>About</h2>
                    <p className={styles.description}><strong>Business Name:</strong> {businessProfile.business_name}</p>
                    <p className={styles.description}><strong>Industry:</strong> {businessProfile.industry}</p>
                </div>
                
                <div className={styles.postsSection}>
                    <div className={styles.postsHeader}>
                        <h2 className={styles.featureTitle}>Job Listings</h2>
                        {profile?.username === username && (
                            <div>
                                <button
                                    className={styles.editButton}
                                    onClick={handleNewJobListing}
                                    data-testid="listing-button"
                                >
                                    Add Listing
                                </button>
                            </div>
                        )}
                    </div>

                    {jobListings.map((listing, index) => (
                    <div
                        key={listing.id || index}
                        className={styles.jobCard}
                        onClick={() => handleJobListingClick(listing)}
                    >
                        <div className={styles.header}>
                        <h3 className={styles.jobTitle}>{listing.event_title}</h3>
                        <span className={styles.venue}>{listing.venue}</span>
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

                        {profile?.username == username && (
                        <div className={styles.cardActions}>
                            <button className={styles.viewApplicantsButton} onClick={(e) => {
                                e.stopPropagation();
                                handleViewApplicants(listing.id);
                            }}>
                            View Applicants
                            </button>
                            <button className={styles.editAppButton} onClick={(e) => {
                                e.stopPropagation();
                                handleEditJob(listing.id);
                            }}>
                            Edit
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