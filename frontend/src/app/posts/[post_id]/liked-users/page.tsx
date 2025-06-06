"use client";

import styles from "@/styles/Discover.module.css";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import axios from "axios";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import Toolbar from '@/components/toolbars/toolbar';
import { Avatar } from "@mui/material";

interface User {
    username: string;
    id: string;
    isFollowing: boolean;
}

export default function LikedUsers() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading } = useAuth();

    const { post_id } = useParams();
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchLikedUsers = async (query = "", pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/liked-users/`, {
                params: {
                    post_id: post_id,
                    search: query,
                    page: pageNum
                },
                paramsSerializer: params => {
                    const searchParams = new URLSearchParams();
                    Object.keys(params).forEach(key => {
                        if (Array.isArray(params[key])) {
                            params[key].forEach(val => searchParams.append(key, val));
                        } else {
                            searchParams.append(key, params[key]);
                        }
                    });
                    return searchParams.toString();
                },
                headers: {
                    "Authorization": `Bearer ${Cookies.get("access_token")}`
                }
            });

            if (pageNum === 1) {
                setUsers(response.data.results);
            } else {
                setUsers((prevUsers) => [...prevUsers, ...response.data.results]);
            }
    
            setHasMore(response.data.next !== null);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchUsers = debounce((query) => {
        setPage(1);
        fetchLikedUsers(query, 1);
    }, 300);

    useEffect(() => {
        debouncedFetchUsers(searchTerm);
        return () => debouncedFetchUsers.cancel();
    }, [searchTerm]);

    const loadMoreUsers = () => {
        if (hasMore && !loading) {
            fetchLikedUsers(searchTerm, page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handleUserClick = (username: string) => {
        router.push(`/${username}/`);
    };

    return (
        <div>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search usernames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* User List */}
            <ul className={styles.userList}>
                {users.length > 0 ? (
                    users.map((user, index) => (
                    <li key={index} className={styles.userCard} onClick={() => handleUserClick(user.username)} data-testid={`user-item-${user}`}>
                        <div className={styles.profileImageContainer}>
                            <Avatar alt={`${user}'s profile photo`} src={"/savvy.png"} sx={{ width: 64, height: 64, cursor: 'pointer' }}/>
                        </div>
                        <span className={styles.username}>{user.username}</span>
                    </li>
                    ))
                ) : (
                    <p>No users found.</p>
                )}
            </ul>

            {hasMore && (
                <button onClick={loadMoreUsers} disabled={loading} data-testid="load-more-button">
                    Load More
                </button>
            )}
        </div>
    )
};