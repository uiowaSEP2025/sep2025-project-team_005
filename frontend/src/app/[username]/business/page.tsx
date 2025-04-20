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

interface JobListing {}

export default function BusinessProfile() {
    useRequireAuth();

    const router = useRouter();
    const { username } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [followCount, setFollowCount] = useState<FollowCount | null>(null);
    const [userId, setUserId] = useState<UserID | null>(null);
    const [jobListing, setJobListing] = useState<JobListing[]>([]);
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

    // Fetch Follow Count  ********* Needs updates
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

    const handleJobListing = async () => {
        
    };

    const handleNavigation = (user_id: string, type: "followers" | "following") => {
        router.push(`/follow/${user_id}?type=${type}`);
    };

    const fetchJobListings = async (username: string, pageNum = 1) => {
        setLoading(true);
        try {
            
        } 
        finally {
            setLoading(false);
        }
    };

    const handleJobListingClick = async (post: JobListing) => {
        router.push("") // TODO: replace with route to individual JobListing view
    }

    const debouncedFetchJobListings = debounce(() => {
        setPage(1);
        fetchJobListings(String(username),1);
    }, 300);

    useEffect(() => {
        debouncedFetchJobListings();
    }, [username]);

    const loadMoreJobListings = () => {
        if (hasMore && !loading) {
            fetchJobListings(String(username), page + 1);
            setPage((prevPage) => prevPage + 1);
        }
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
                    </div>
                </div>
            </div>
        </div>
    );
}