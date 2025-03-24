"use client";

import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

import styles from "@/styles/DiscoverProfile.module.css";

interface UserProfile {
    stage_name: string;
    years_played: number;
    home_studio: boolean;
    genres: string[];
    instruments: string[];
}

interface UserID {
    user: string;
}

export default function DiscoverProfile() {
    useRequireAuth();
    
    const router = useRouter();
    const { username } = useParams();
    const { profile, isLoading } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [user_id, setUserId] = useState<UserID | null>(null);


    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axios.get<UserID>(`http://localhost:8000/user/${username}/`, {
                    withCredentials: true,
                });

                setUserId(response.data);

            } 
            catch (error) {
                console.error("Error fetching user ID:", error);
            }
        };

        if (username) {
            fetchUserId();
        }
    }, [username]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user_id) return;
            
            try {
                const response = await fetch(`http://localhost:8000/musician/${user_id.user}`, {
                    method: "GET",
                    credentials: "include",  // Ensure credentials are included for CORS
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setUserProfile(data);
                } else {
                    console.error("Failed to fetch musician profile", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching musician profile:", error);
            }
        };
    
        if (user_id) {
            fetchProfile();
        }
    }, [user_id]);
    

    if (isLoading || !userProfile) return <p className="description">Loading...</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Image 
                    src="/savvy.png" 
                    alt={`${username}'s profile picture`} 
                    width={120} 
                    height={120} 
                    className={styles.profilePhoto}
                />
                <h1 className={styles.title}>{userProfile.stage_name || username}</h1>
                <p className={styles.description}>Years Played: {userProfile.years_played}</p>
                <p className={styles.description}>Home Studio: {userProfile.home_studio ? "Yes" : "No"}</p>
                <p className={styles.description}>Genres: {userProfile.genres.join(", ")}</p>
                <p className={styles.description}>Instruments: {userProfile.instruments.join(", ")}</p>
            </div>
            <div className={styles.features}>
                <h2 className={styles.featureTitle}>Posts</h2>
            </div>
        </div>
    );
}