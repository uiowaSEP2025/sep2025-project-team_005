"use client";

import { useState, useEffect } from "react";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import Cookies from "js-cookie";

import Image from "next/image";
import styles from "@/styles/AccountSettings.module.css";
import { Button } from "@mui/material";

interface User {
    id: string;
    username: string;
    profilePhoto: string;
    isBlocked: boolean;
}

const sections = {
  account: "Account Info",
  blocked: "View Blocked Users",
  liked: "Liked Posts",
  security: "Security",
  privacy: "Privacy Settings",
};

export default function SettingsPage() {
    useRequireAuth();

    const [activeSection, setActiveSection] = useState<keyof typeof sections>("account");
    const { profile, isLoading } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const NEXT_PUBLIC_BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    const fetchBlockList = async (pageNum = 1, reset = false) => {
        if (!hasMore || loading || !profile) return;
    
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/api/block-list/${profile.id}/?page=${pageNum}`,
                { 
                    method: "GET", 
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("access_token")}`
                    }
                }
            );
    
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setBlockedUsers(prevUsers => (reset ? data.results : [...prevUsers, ...data.results]));
                setHasMore(!!data.next);
            } else {
                console.error("Failed to fetch block list", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching block list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (userId: string) => {
        setLoading(true); // Set loading to true while making the request
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/block/${userId}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${Cookies.get("access_token")}`,
                    "Content-Type": "application/json",
                },
            });
    
            if (response.ok) {
                // Remove the user from the blocked users list after unblocking
                setBlockedUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            } else {
                const errorData = await response.json();
                console.error("Error unblocking user:", errorData.error);
            }
        } catch (error) {
            console.error("Error unblocking user:", error);
        } finally {
            setLoading(false); // Set loading to false after the request is complete
        }
    };    

    // Fetch the first page of blocked users page
    useEffect(() => {
        if (activeSection === "blocked") {
            fetchBlockList(1, true);
        }
    }, [activeSection]);

    const loadMoreUsers = () => {
        if (hasMore && !loading) {
            fetchBlockList(page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };
    
    // Render page based on side bar selection
    const renderSection = () => {
        switch (activeSection) {
        case "account":
            return (
                <>
                    <h2 className={styles.sectionTitle}>Your Account Info</h2>
                    <div className={styles.accountInfo}>
                    <p><strong>Username:</strong> johndoe</p>
                    <p><strong>Email:</strong> johndoe@example.com</p>
                    <p><strong>Joined:</strong> January 1, 2024</p>
                    </div>
                </>
            );
        case "blocked":
            return (
                <>
                    <h2 className={styles.sectionTitle}>Blocked Users</h2>
                    <div className={styles.userList}>
                        {blockedUsers.length === 0 ? (
                            <p>No users are currently blocked.</p>
                        ) : (
                            blockedUsers.map((user) => (
                                <div key={user.id} className={styles.userCard}>
                                    <div className={styles.userInfo}>
                                        <Image
                                            src={user.profilePhoto || "/savvy.png"}
                                            alt={`${user.username}'s profile photo`}
                                            width={50}
                                            height={50}
                                            className={styles.profilePhoto}
                                        />
                                        <span className={styles.username} > {user.username} </span>
                                        {profile && user.id !== profile.id.toString() && (
                                            <button 
                                                className={styles.blockButton} 
                                                onClick={() => handleUnblock(user.id)}
                                            >
                                                Unblock
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {hasMore && (
                            <Button onClick={loadMoreUsers} disabled={loading}>Load More</Button>
                        )}   
                    </div>
                </>
            );
            
        case "liked":
            return <h2 className={styles.sectionTitle}>Liked Posts (Coming Soon)</h2>;
        case "security":
            return <h2 className={styles.sectionTitle}>Security Settings (Coming Soon)</h2>;
        case "privacy":
            return <h2 className={styles.sectionTitle}>Privacy Settings (Coming Soon)</h2>;
        default:
            return null;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Account Settings</h1>
                <p className={styles.description}>Manage your account, preferences, and privacy</p>
            </div>

            <div className={styles.settingsLayout}>
                {/* Sidebar */}
                <aside className={styles.settingsSidebar}>
                <ul className={styles.menu}>
                    {Object.entries(sections).map(([key, label]) => (
                    <li key={key}>
                        <button
                            onClick={() => setActiveSection(key as keyof typeof sections)}
                            className={`${styles.menuItem} ${activeSection === key ? styles.activeItem : ""}`}
                            >
                            <span className={styles.menuText}>{label}</span>
                        </button>
                    </li>
                    ))}
                </ul>
                </aside>

                {/* Main Content */}
                <main className={styles.settingsMain}>{renderSection()}</main>
            </div>
        </div>
    );
}