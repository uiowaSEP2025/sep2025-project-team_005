"use client";

import React from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";

import axios from "axios";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import Toolbar from '@/components/toolbars/toolbar';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';

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

interface Post {
    [key: string]: string;
}

export default function Feed() {
    useRequireAuth();

    const router = useRouter();
    const { username } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [userId, setUserId] = useState<UserID | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

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

    const handleNavigation = (user_id: string, type: "followers" | "following") => {
        router.push(`/follow/${user_id}?type=${type}`);
    };

    const fetchPosts = async (username: string, pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/fetch-posts/', {
                params: {
                    username: username,
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
                }
            });

            if (pageNum === 1) {
                setPosts(response.data.results);
            } else {
                setPosts((prevPosts) => [...prevPosts, ...response.data.results]);
            }

            setHasMore(response.data.next !== null);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = async (post: Post) => {
        router.push("") // TODO: replace with route to individual post view
    }

    const debouncedFetchPosts = debounce(() => {
        setPage(1);
        fetchPosts(String(username),1);
    }, 300);

    useEffect(() => {
        debouncedFetchPosts();
    }, [username]);

    const loadMorePosts = () => {
        if (hasMore && !loading) {
            fetchPosts(String(username), page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

    if (isLoading) return <p className="description">Loading...</p>;

    return (
        <Box>
            <Toolbar />    
            <Box sx={{ marginLeft: '20%', flexGrow: 1, padding: '1rem' }}>
                <Card sx={{ marginBottom: '1rem' }}>
                    <CardMedia
                    component="img"
                    height="300"
                    image="https://via.placeholder.com/600"
                    alt="Post image"
                    />
                    <CardContent>
                    <Typography variant="h6">Caption</Typography>
                    <Box sx={{ marginTop: '1rem' }}>
                        <Typography variant="body2"><strong>user</strong> Comment </Typography>
                        <Typography variant="body2"><strong>user</strong> Comment</Typography>
                        <Typography variant="body2"><strong>user</strong> Comment </Typography>
                    </Box>
                    </CardContent>
                </Card>
    
            </Box>
        </Box>
    );
}