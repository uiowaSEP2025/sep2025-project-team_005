"use client";

import React from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import Image from "next/image";
import Head from "next/head";

import styles from "@/styles/Profile.module.css";
import axios from "axios";
import Cookies from "js-cookie";

interface UserID {
    user_id: string;
}

interface MusicianProfile {
    stage_name: string;
    years_played: number;
    home_studio: boolean;
    genres: string[];
    instruments: { instrument_name: string; years_played: number }[];
}

interface FollowCount {
    follower_count: number;
    following_count: number;
}

export default function DiscoverProfile() {
    useRequireAuth();

    const router = useRouter();
    const { username } = useParams();
    const { profile, isLoading } = useAuth();
    const [musicianProfile, setMusicianProfile] = useState<MusicianProfile | null>(null);
    const [followCount, setFollowCount] = useState<FollowCount | null>(null);
    const [userId, setUserId] = useState<UserID | null>(null);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            if (!username) return; // Ensure username is available

            try {
                const response = await fetch(`http://localhost:8000/api/user/${username}/`, {
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

    // Fetch Musician Profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`http://localhost:8000/api/musician/${userId.user_id}/`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setMusicianProfile(data);
                } else {
                    console.error("Failed to fetch musician profile", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching musician profile:", error);
            }
        };

        fetchProfile();
    }, [userId]);

    // Fetch Follow Count
    useEffect(() => {
        const fetchFollowCount = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`http://localhost:8000/api/follower/${userId.user_id}/`, {
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

    const handleUpdateProfile = async () =>  {
        try {
            router.push("/settings/user");
        } catch (error) {
            console.error(error)
        }
    }

    const handleSettings = async () => {
        // TODO: Create settings
    }

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8000/api/auth/logout/", {
                credentials: "include",
            });

            // Clear stored token
            Cookies.remove("access_token");

            // Redirect to login page
            router.push("/login");
        } 
        catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleDropdownToggle = () => {
        setDropdownOpen(prevState => !prevState);
    };

    const handleBlockUser = () => {
        // Add functionality for "Block User"
        //console.log("User blocked");
    };

    const handleNavigation = (user_id: string, type: "followers" | "following") => {
        router.push(`/follow/${user_id}?type=${type}`);
    };

    if (isLoading || !musicianProfile || !followCount) return <p className="description">Loading...</p>;

    return (
        <>
            <Head>
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            </Head>
            <div className={styles.container}>
                <div className={styles.profileHeader}>
                    <Image 
                        src="/savvy.png" 
                        alt={`${username}'s profile picture`} 
                        width={120} 
                        height={120} 
                        className={styles.profilePhoto}
                    />
                    <div className={styles.profileInfo}>
                        <div className={styles.headerWithDots}>
                            <h1 className={styles.title}>{musicianProfile.stage_name || username}</h1>
                            {/* Three-Dot Button */}
                            <div className={styles.threeDotButton} onClick={handleDropdownToggle} data-testid="dropdown-button">
                                <FaEllipsisV size={24} />
                            </div>
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
                        {profile?.username !== username && (
                            <div className={styles.profileActions}>
                                <button className={styles.followButton}>Follow</button>
                                <button className={styles.messageButton}>Message</button>
                            </div>
                        )}
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        profile?.username === username ? (
                            <div>
                                <button className={styles.dropdownItem} onClick={handleSettings} data-testid="setting-button">Settings</button>
                                <button className={styles.dropdownItem} onClick={handleLogout} data-testid="logout-button">Logout</button>
                            </div>
                        ) : (
                            <div className={styles.dropdownMenu}>
                                <button className={styles.dropdownItem} onClick={handleBlockUser}>
                                    Block User
                                </button>
                            </div>
                        )
                    )}
                </div>

                <div className={styles.bioSection}>
                    {profile?.username === username && (
                        <button className={styles.editButton} onClick={handleUpdateProfile}>Edit</button>
                    )}
                    <h2 className={styles.bioTitle}>About</h2>
                    <p className={styles.description}><strong>Home Studio:</strong> {musicianProfile.home_studio ? "Yes" : "No"}</p>
                    <p className={styles.description}><strong>Genres:</strong> {musicianProfile.genres.join(", ")}</p>
                    <p className={styles.description}>
                        <strong>Instruments: </strong>
                        <span>
                            {musicianProfile.instruments.map((instr, index) => (
                                <React.Fragment key={index}>
                                    {instr.instrument_name} - {instr.years_played} years
                                    {index < musicianProfile.instruments.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </span>
                    </p>
                </div>
                
                <div className={styles.postsSection}>
                    <h2 className={styles.featureTitle}>Posts</h2>
                    <div className={styles.postsGrid}>
                        <div className={styles.postCard}>🎵 Post 1</div>
                        <div className={styles.postCard}>🎵 Post 2</div>
                        <div className={styles.postCard}>🎵 Post 3</div>
                    </div>
                </div>
            </div>
        </>
    );
}