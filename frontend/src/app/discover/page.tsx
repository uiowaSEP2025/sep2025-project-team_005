"use client";

import styles from "@/styles/Discover.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext"
import axios from "axios";
import debounce from "lodash.debounce";

export default function Discover() {
    //useRequireAuth();
    
    const router = useRouter();
    const { profile, isLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch users from the backend
    const fetchUsers = async (query = "", pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/create/`, {
                params: { search: query, page: pageNum }
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

    // Debounce search to prevent excessive API calls
    const debouncedFetchUsers = debounce((query) => {
        setPage(1);
        fetchUsers(query, 1);
    }, 300);

    // Run when searchTerm changes
    useEffect(() => {
        debouncedFetchUsers(searchTerm);
        return () => debouncedFetchUsers.cancel();
    }, [searchTerm]);

    // Infinite Scroll (Load More)
    const loadMoreUsers = () => {
        if (hasMore && !loading) {
            fetchUsers(searchTerm, page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

    // Navigate to selected user profile
    const handleUserClick = (username: string) => {
        router.push(`/discoverprofile/${username}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Discover Musicians</h1>
                <p className={styles.description}>
                    Search for musicians and connect with them.
                </p>
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search usernames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && <p>Loading users...</p>}

            <ul className={styles.userList}>
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <li key={index} className={styles.userCard} onClick={() => handleUserClick(user)}
                        style={{ cursor: "pointer" }}>
                            {user}
                        </li>
                    ))
                ) : (
                    <p>No users found.</p>
                )}
            </ul>

            {hasMore && (
                <button onClick={loadMoreUsers} disabled={loading}>
                    Load More
                </button>
            )}
        </div>
    );
}
