"use client";

import styles from "@/styles/Discover.module.css";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import axios from "axios";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";

interface User {
    username: string;
    id: string;
    isFollowing: boolean;
    latest_message: MessageInterface;
}

interface MessageInterface {
    id: string;
    created_at: string;
    s3_urls: string[];
    sender: User;
    receiver: User;
    like_count: number;
    message: string;
}

export default function Messages() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading } = useAuth();

    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchConversations = async (query = "", pageNum = 1) => {
        if (!profile) return;
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/active-conversations/`, {
                params: {
                    user_id: profile.id,
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
        fetchConversations(query, 1);
    }, 300);

    useEffect(() => {
        debouncedFetchUsers(searchTerm);
        return () => debouncedFetchUsers.cancel();
    }, [searchTerm, profile]);

    const loadMoreUsers = () => {
        if (hasMore && !loading) {
            fetchConversations(searchTerm, page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handleConversationClick = (id: string) => {
        router.push(`/messages/${id}/`);
    };

    const handleNewConversation = () => {
        router.push(`/messages/new-conversation/`);
    }

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
            <Button variant='contained' onClick={() => handleNewConversation()}><Add /></Button>
            <ul className={styles.userList}>
                {users.length > 0 ? (
                    users.map((user, index) => {
                    const isSameDay = new Date(user.latest_message?.created_at).toDateString() === new Date().toDateString();

                    const timestamp = isSameDay
                        ? new Date(user.latest_message?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(user.latest_message?.created_at).toLocaleDateString(undefined, {
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: '2-digit'
                        });
                    return (
                        <li 
                            key={index} 
                            onClick={() => handleConversationClick(user.id)} 
                            data-testid={`user-item-${user}`}
                            // style={{ listStyle: 'none', padding: '1rem', borderBottom: '1px solid #ddd', cursor: 'pointer' }}
                            className={styles.userCard}
                        >
                            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                <Box display="flex" alignItems="center" gap={2} minWidth="200px">
                                    <Avatar 
                                        alt={`${user.username}'s profile photo`} 
                                        src={"/savvy.png"} 
                                        sx={{ width: 64, height: 64, cursor: 'pointer' }} 
                                    />
                                    <Typography variant="subtitle1">{user.username}</Typography>
                                </Box>

                                <Box 
                                    flexGrow={1} 
                                    mx={2} 
                                    overflow="hidden"
                                >
                                    <Typography 
                                        variant="body2" 
                                        noWrap 
                                        sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                    >
                                        {user.latest_message?.sender?.username === profile?.username 
                                        ? "You: " 
                                        : user.latest_message?.sender?.username + ": "}
                                        {user.latest_message?.message}
                                    </Typography>
                                </Box>

                                <Box minWidth="80px" textAlign="right">
                                    <Typography variant="caption">{timestamp}</Typography>
                                </Box>
                            </Box>
                        </li>
                    )})
                ) : (
                    <p>No conversations found.</p>
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