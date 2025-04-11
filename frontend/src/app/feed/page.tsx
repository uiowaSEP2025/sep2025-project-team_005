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
import { ArrowBack, ArrowForward, ChatBubbleOutline, ThumbUpOutlined } from '@mui/icons-material';
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
    const { profile, isLoading, setProfile } = useAuth();
    const [userId, setUserId] = useState<UserID | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set());
    const [reportedPosts, setReportedPosts] = useState<Set<string>>(new Set());
    const [expandedPostDescriptions, setExpandedPostDescriptions] = useState<Set<string>>(new Set());
    const [postImages, setPostImages] = useState<{ postId: string; imageIndex: number }[]>([]);

    useEffect(() => {
        if (!isLoading && profile) {
            fetchFeed();
            debouncedFetchPosts();
        }
    }, [isLoading, profile]);

    useEffect(() => {
        if (posts.length > 0) {
            setPostImages(
                posts.map(post => ({
                postId: post.id,
                imageIndex: 0,
                }))
            );
        }
    }, [posts]);

    const fetchFeed = async (pageNum = 1) => {
        if (!profile) return;
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/fetch-feed/', {
                params: {
                    username: profile.username,
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
        fetchFeed();
    }, 300);

    const loadMorePosts = () => {
        if (hasMore && !loading) {
            fetchFeed(page + 1);
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

    const handleUnhide = async (post: Post) => {
        setHiddenPosts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(post.id);
            return newSet;
        });    
        setReportedPosts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(post.id);
            return newSet;
        });   
    }

    const toggleDescription = (post: Post) => {
        setExpandedPostDescriptions((prev) => {
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
        setReportedPosts((prev) => new Set(prev.add(post.id)));
        // TODO: Actually report instead of hiding.
    }

    const handleProfile = async (username: string) => {
        router.push(`/${username}`)
    }

    const handleNextImage = (postId: string) => {
        setPostImages((prevImages) => 
            prevImages.map((post) => {
                const currentPost = posts.find((post) => post.id === postId);
    
                if (post.postId === postId && currentPost) {
                    return {
                        ...post,
                        imageIndex: Math.min(post.imageIndex + 1, currentPost.s3_urls.length - 1),
                    };
                }
                return post;
            })
        );
    };

    const handlePreviousImage = (postId: string) => {
        setPostImages((prevImages) => 
            prevImages.map((post) => {    
                if (post.postId === postId) {
                    return {
                        ...post,
                        imageIndex: Math.max(post.imageIndex - 1, 0),
                    };
                }
                return post;
            })
        );
    };

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
                                !reportedPosts.has(post.id) ? (
                                    <Card key={post.id} sx={{ marginBottom: '1rem', width: '50%', height: '50%', objectFit: 'cover' }}>
                                        <Box sx={{ backgroundColor: 'black', color: 'white', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CardActions onClick={() => handleProfile(post?.owner.username)} sx={{ cursor: 'pointer' }}>
                                                    <Avatar alt="User" src={"/savvy.png"} sx={{ width: 64, height: 64 }} />
                                                    <Typography variant="h6">{post.owner.username || 'Username'}</Typography>
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
                                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                            <CardActionArea onClick={() => handlePostClick(post)}>
                                                <CardMedia
                                                    component="img"
                                                    image={post.s3_urls[postImages.find(p => p.postId === post.id)?.imageIndex ?? 0]}
                                                    alt="Image"
                                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </CardActionArea>

                                            {postImages.find(p => p.postId === post.id)?.imageIndex !== 0 && (
                                                <Button
                                                    onClick={() => handlePreviousImage(post.id)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: 0,
                                                        transform: 'translateY(-50%)',
                                                        backgroundColor: 'black',
                                                        opacity: 0.8,
                                                    }}
                                                >
                                                    <ArrowBack />
                                                </Button>
                                            )}

                                            {postImages.find(p => p.postId === post.id)?.imageIndex !== post.s3_urls.length - 1 && (
                                                <Button
                                                    onClick={() => handleNextImage(post.id)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        right: 0,
                                                        transform: 'translateY(-50%)',
                                                        backgroundColor: 'black',
                                                        opacity: 0.8,
                                                    }}
                                                >
                                                    <ArrowForward />
                                                </Button>
                                            )}
                                        </Box>
                                        <CardContent>
                                            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                            {`${
                                                post.caption.length === 0
                                                    ? ""
                                                    : expandedPostDescriptions.has(post.id)
                                                        ? post.owner.username + ': ' + post.caption
                                                        : post.caption.length > 100
                                                            ? post.owner.username + ': ' + post.caption.slice(0, 100) + '...'
                                                            : post.owner.username + ': ' + post.caption
                                            }`}
                                            </Typography>
                                            {post.caption.length > 100 && (
                                                <Button onClick={() => toggleDescription(post)}>
                                                    {expandedPostDescriptions.has(post.id) ? "Show Less" : "Show More"}
                                                </Button>
                                            )}
                                        </CardContent>
                                        <CardActions>
                                            {/* ThumbUp for if liked */}
                                            <Button onClick={() => handleLikeToggle(post)}><ThumbUpOutlined/></Button>
                                            <Button onClick={() => handleCommentClick(post)}><ChatBubbleOutline/></Button>
                                            <Button variant="contained" onClick={() => handleShareClick(post)}>Share</Button>
                                        </CardActions>
                                    </Card>
                                ) : (
                                    <Card key={post.id} sx={{ marginBottom: '1rem', width: '50%', height: '50%', objectFit: 'cover' }}>
                                        <CardContent>
                                            <Typography>Thank you for your feedback. Admins will be notified in a later sprint.</Typography>
                                            <Button onClick={() => handleUnhide(post)}>Unhide</Button>
                                        </CardContent>
                                    </Card>
                                )
                            ) : (
                                <Card key={post.id} sx={{ marginBottom: '1rem', width: '50%', height: '50%', objectFit: 'cover' }}>
                                    <CardContent>
                                        <Typography>This post is hidden.</Typography>
                                        <Button onClick={() => handleUnhide(post)}>Unhide</Button>
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