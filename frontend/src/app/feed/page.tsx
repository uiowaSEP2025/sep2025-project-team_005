"use client";

import React from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";

import axios from "axios";
import debounce from "lodash.debounce";
import Toolbar from '@/components/toolbars/toolbar';
import Dropdown from '@/components/menus/dropdown';
import { Box, Card, CardActions, CardActionArea, CardContent, CardMedia, Typography, Button, Avatar } from '@mui/material';
import { ThumbUpOffAlt, ChatBubbleOutline } from '@mui/icons-material';
import { FaEllipsisV } from 'react-icons/fa';
import Cookies from "js-cookie";

interface UserID {
    user_id: string;
}

interface User {
    username: string;
    id: string;
  }

interface Post {
    owner: User;
    id: string;
    created_at: string;
    caption: string;
    s3_urls: string[];
}

export default function Feed() {
    useRequireAuth();

    const router = useRouter();
    // username is not a param - needs to get user from useAuth
    const { username } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [userId, setUserId] = useState<UserID | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set());
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

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

    const fetchFeed = async (username: string, pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/fetch-feed/', {
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

    const handleLikeToggle = async (post: Post) => {
    //     if (!userId) return;
    
    //     try {
    //         let response;
    
    //         const isLiked = post.liked_by_user;
    
    //         if (isLiked) {
    //             response = await axios.delete('http://localhost:8000/api/post/like/', {
    //                 headers: {
    //                     Authorization: `Bearer ${Cookies.get("access_token")}`,
    //                 },
    //                 data: { post_id: post.id },
    //             });
    //         } else {
    //             response = await axios.post(
    //                 'http://localhost:8000/api/post/like/',
    //                 { post_id: post.id },
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${Cookies.get("access_token")}`,
    //                     },
    //                 }
    //             );
    //         }
    
    //         if (response.status >= 200 && response.status < 300) {
    //             alert(isLiked ? "Like removed!" : "Like created!");
    //             console.log("Request successful:", response.data);
    //         } else {
    //             alert("Like request failed. Please refresh the page and try again.");
    //             console.error("Request failed:", response.status, response.statusText);
    //         }
    //     } catch (error) {
    //         console.error("Error toggling like status:", error);
    //     }
    };

    const handleBlock = async (user: User) => {
        if (!user) return;
    
        try {
            const response = await axios.post(`http://localhost:8000/api/block/${user.id}/`, {
            });
    
            if (response.status >= 200 && response.status < 300) {
                alert("User blocked.");
                console.log("Request successful:", response.data);
            } else {
                alert("Failed to block user.");
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error blocking user:", error);
        }
    }; 

    const debouncedFetchPosts = debounce(() => {
        setPage(1);
        fetchFeed(String(username),1);
    }, 300);

    useEffect(() => {
        debouncedFetchPosts();
    }, [username]);

    const loadMorePosts = () => {
        if (hasMore && !loading) {
            fetchFeed(String(username), page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handlePostClick = async (post: Post) => {
        router.push("") // TODO: replace with route to individual post view
    }

    const handleLikeClick = async (post: Post) => {
        // post like creation
    }

    const handleCommentClick = async (post: Post) => {
        router.push("") // TODO: replace with route to individual post-comment view
    }

    const handleShareClick = async (post: Post) => {
        router.push("") // TODO: replace with route to individual share view
    }

    const handleFollow = async (post: Post) => {
        //
    }

    const handleHide = async (post: Post) => {
        setHiddenPosts((prev) => new Set(prev.add(post.id)));
    }

    const handleUnblock = async (post: Post) => {
        setHiddenPosts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(post.id);
            return newSet;
        });    
    }

    const toggleDescription = (post: Post) => {
        setExpandedPosts((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(post.id)) {
            newSet.delete(post.id);
          } else {
            newSet.add(post.id);
          }
          return newSet;
        });
    };

    const handleReport = async (post: Post) => {
        // TODO
    }

    const handleProfile = async (username: string) => {
        router.push(`/${username}`)
    }

    if (isLoading) return <p className="description">Loading...</p>;

    return (
        <Box>
            <Toolbar />    
            <Box sx={{ marginLeft: '20%', padding: '1rem' }}>
                {loading && <p>Loading posts...</p>}
                {posts.length > 0 ? (
                    <Box>
                        {posts.map((post) => (
                            !hiddenPosts.has(post.id) ? (
                                <Card key={post.id} sx={{ marginBottom: '1rem', width: '50%', height: '50%', objectFit: 'cover' }}>
                                    <Box sx={{ backgroundColor: 'black', color: 'white', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CardActions onClick={() => handleProfile(post?.owner.username)} sx={{ cursor: 'pointer' }}>
                                                <Avatar alt="User" src={"/savvy.png"} sx={{ width: 64, height: 64 }} />
                                                <Typography variant="body1">{post.owner.username || 'Username'}</Typography>
                                            </CardActions>
                                        </Box>
                                        <Box display="flex" gap={1}>
                                            <Button size="small" variant="contained" onClick={() => handleFollow(post)}>Follow</Button>
                                            <Dropdown buttonLabel={<FaEllipsisV size={24} />}menuItems=
                                                {[
                                                    { label: "Hide Post", onClick: () => handleHide(post) },
                                                    { label: "Report Post", onClick: () => handleReport(post) },
                                                    { label: "Block User", onClick: () => handleBlock(post.owner) },
                                                ]}>
                                            </Dropdown>
                                        </Box>
                                    </Box>
                                    <CardActionArea onClick={() => handlePostClick(post)}>
                                        <CardMedia
                                            component="img"
                                            image={post.s3_urls[1]}
                                            alt="Image"
                                        />
                                    </CardActionArea>
                                    <CardContent>
                                        <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {`${post.owner.username}: ${
                                            expandedPosts.has(post.id)
                                            ? post.caption
                                            : post.caption.length > 100
                                                ? post.caption.slice(0, 100) + '...'
                                                : post.caption
                                        }`}
                                        </Typography>
                                        {post.caption.length > 100 && (
                                            <Button onClick={() => toggleDescription(post)}>
                                                {expandedPosts.has(post.id) ? "Show Less" : "Show More"}
                                            </Button>
                                        )}
                                    </CardContent>
                                    <CardActions>
                                        {/* ThumbUpAlt for if liked */}
                                        <Button startIcon={<ThumbUpOffAlt />} onClick={() => handleLikeToggle(post)}></Button>
                                        <Button startIcon={<ChatBubbleOutline />} onClick={() => handleCommentClick(post)}></Button>
                                        <Button variant="contained" onClick={() => handleShareClick(post)}>Share</Button>
                                    </CardActions>
                                </Card>
                            ) : (
                                <Card key={post.id} sx={{ marginBottom: '1rem', width: '50%', height: '50%', objectFit: 'cover' }}>
                                    <CardContent>
                                        <Typography>This post is hidden.</Typography>
                                        <Button onClick={() => handleUnblock(post)}>Unhide</Button>
                                    </CardContent>
                                </Card>
                            )
                        ))}
                    </Box>
                ) : (
                    <Typography>No posts found.</Typography>
                )}
                {hasMore && (
                    <Button onClick={loadMorePosts} disabled={loading}>Load More</Button>
                )}   
            </Box>
        </Box>
    );
}