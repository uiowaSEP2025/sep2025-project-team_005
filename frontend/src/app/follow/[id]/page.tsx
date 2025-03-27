"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/styles/FollowList.module.css";

interface User {
    id: string;
    username: string;
    profilePhoto: string;
    isFollowing: boolean;
}

export default function FollowPage() {
    useRequireAuth();

    const router = useRouter();
    const { id } = useParams();
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "followers"; // Default to followers

    const { profile, isLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUsers([]);
        setPage(1);
        setHasMore(true);
        fetchFollowList(1, true);
    }, [id, type]);

    const fetchFollowList = async (pageNum = 1, reset = false) => {
        if (!id || !hasMore || loading) return;

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8000/api/follow-list/${id}/?type=${type}&page=${pageNum}`,
                { method: "GET", credentials: "include" }
            );

            if (response.ok) {
                const data = await response.json();
                setUsers(prevUsers => (reset ? data.results : [...prevUsers, ...data.results]));
                setHasMore(!!data.next);
            } else {
                console.error("Failed to fetch follow list", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching follow list:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreUsers = () => {
        if (hasMore && !loading) {
            fetchFollowList(page + 1);
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleUserClick = (username: string) => {
        router.push(`/${username}`);
    };

    const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
        try {
            const response = await fetch(`http://localhost:8000/follow/${userId}/`, {
                method: isFollowing ? "DELETE" : "POST",
                credentials: "include",
            });
            
            if (response.ok) {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? { ...user, isFollowing: !isFollowing } : user
                    )
                );
            } else {
                console.error("Failed to toggle follow status");
            }
        } catch (error) {
            console.error("Error toggling follow status:", error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{type === "following" ? "Following" : "Followers"}</h1>
            
            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchBar}
            />

            <div className={styles.userList}>
                {users
                    .filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(user => (
                        <div key={user.id} className={styles.userCard}>
                            <div className={styles.userInfo}>
                                <Image
                                    src={user.profilePhoto || "/savvy.png"}
                                    alt={`${user.username}'s profile photo`}
                                    width={50}
                                    height={50}
                                    className={styles.profilePhoto}
                                />
                                <button className={styles.username} onClick={() => handleUserClick(user.username)}>
                                    {user.username}
                                </button>
                                <button 
                                    className={styles.followButton} 
                                    onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                                >
                                    {user.isFollowing ? "Unfollow" : "Follow"}
                                </button>
                            </div>
                        </div>
                    ))}
            </div>

            {hasMore && (
                <button className={styles.loadMore} onClick={loadMoreUsers} disabled={loading}>
                    {loading ? "Loading..." : "Load More"}
                </button>
            )}
        </div>
    );
}