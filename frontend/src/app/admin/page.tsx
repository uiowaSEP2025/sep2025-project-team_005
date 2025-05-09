"use client";

import { useState, useEffect } from "react";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { Box, Card, CardActions, CardActionArea, CardContent, CardMedia, Typography, Button, Avatar } from '@mui/material';
import Cookies from "js-cookie";

import Image from "next/image";
import styles from "@/styles/AccountSettings.module.css";
import { useRouter } from "next/navigation";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import debounce from "lodash.debounce";
import axios from "axios";

interface User {
    id: string;
    username: string;
}

interface Post {
    owner: User;
    id: string;
    created_at: string;
    caption: string;
    s3_urls: string[];
}

const sections = {
  activeReports: "Active Reports",
  bannedPosts: "Banned Posts",
};

export default function AdminPage() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading } = useAuth();
    const [activeSection, setActiveSection] = useState<keyof typeof sections>("activeReports");
    const [activeReports, setActiveReports] = useState<Post[]>([]);
    const [bannedPosts, setBannedPosts] = useState<Post[]>([]);
    const [reportPage, setReportPage] = useState(1);
    const [banPage, setBanPage] = useState(1);
    const [hasMoreBans, setHasMoreBans] = useState(true);
    const [hasMoreReports, setHasMoreReports] = useState(true);
    const [loading, setLoading] = useState(false);
    const [expandedPostDescriptions, setExpandedPostDescriptions] = useState<Set<string>>(new Set());
    const [postImages, setPostImages] = useState<{ postId: string; imageIndex: number }[]>([]);

    const fetchReportList = async (pageNum = 1) => {
        if (!hasMoreReports || loading || !profile) return;
    
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/api/fetch-reported-posts/?page=${pageNum}`,
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
                if (pageNum === 1) {
                    setActiveReports(data.results);
                } else {
                    setActiveReports((prevPosts) => [...prevPosts, ...data.results]);
                }
                setHasMoreReports(!!data.next);
            } else {
                console.error("Failed to fetch reported posts list", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching reported posts list:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBanList = async (pageNum = 1) => {
        if (!hasMoreBans || loading || !profile) return;
    
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/fetch-banned-posts/`, {
                params: {
                    user_id: profile.id,
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

            if (response.status >= 200 && response.status < 300) {
                if (pageNum === 1) {
                    setBannedPosts(response.data.results);
                } else {
                    setBannedPosts((prevPosts) => [...prevPosts, ...response.data.results]);
                }
                console.log(bannedPosts);
                setHasMoreBans(!!response.data.next);
            } else {
                alert("Failed to block user.");
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error blocking user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (bannedPosts.length > 0) {
            setPostImages(
                bannedPosts.map(post => ({
                postId: post.id,
                imageIndex: 0,
                }))
            );
        }
    }, [bannedPosts, activeSection]);

    useEffect(() => {
        if (activeReports.length > 0) {
            setPostImages(
                activeReports.map(post => ({
                postId: post.id,
                imageIndex: 0,
                }))
            );
        }
    }, [activeReports, activeSection]);

    const loadMorePosts = (isBanned: boolean) => {
        if (isBanned)
        {
            if (hasMoreBans && !loading) {
                fetchBanList(banPage + 1);
                setBanPage((prevPage) => prevPage + 1);
            }
        }
        else
        {
            if (hasMoreReports && !loading) {
                fetchReportList(reportPage + 1);
                setReportPage((prevPage) => prevPage + 1);
            }
        }
    };

    useEffect(() => {
        if (!isLoading && profile && activeSection === "activeReports") {
            fetchReportList(1);
        } else if (!isLoading && profile && activeSection === "bannedPosts") {
            fetchBanList(1);
        }
    }, [activeSection, profile]);


    const handleUnban = async (post: Post) => {
        setLoading(true);
    
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/post/unban/`, {
                post_id: post.id,
            });
    
            if (response.status >= 200 && response.status < 300) {
                setBannedPosts((prevPosts) => prevPosts.filter((bannedPost) => bannedPost.id !== post.id));
                alert("Post unbanned.");
                console.log("Request successful:", response.data);
            } else {
                alert("Failed to unban post.");
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error unbanning post:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleBan = async (post: Post) => {
        if (!profile) return;
        setLoading(true);
    
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/post/ban/`, {
                post_id: post.id,
                admin_id: profile.id,
            });
    
            if (response.status >= 200 && response.status < 300) {
                setBannedPosts((prevPosts) => [...prevPosts, post]);
                setActiveReports((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
                alert("Post banned.");
                console.log("Request successful:", response.data);
            } else {
                alert("Failed to ban post.");
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error banning post:", error);
        } finally {
            setLoading(false);
        }
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
    }

    const handlePostClick = async (post: Post) => {
        router.push("") // TODO: replace with route to individual post view
    }

    const handleProfile = async (username: string) => {
        router.push(`/${username}`)
    }

    const handleNextImage = (postId: string, isBanned: boolean) => {
        setPostImages((prevImages) => 
            prevImages.map((post) => {
                let currentPost = activeReports.find((post) => post.id === postId);
                if(isBanned)
                {
                    currentPost = bannedPosts.find((post) => post.id === postId);
                }
                if (post.postId === postId && currentPost) {
                    return {
                        ...post,
                        imageIndex: Math.min(post.imageIndex + 1, currentPost.s3_urls.length - 1),
                    }
                }
                return post;
            })
        );
    }

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
    
    const renderSection = () => {
        switch (activeSection) {
        case "activeReports":
            return (
                <>
                    <h2 className={styles.sectionTitle}>Active Reports</h2>
                    <Box sx={{ marginLeft: '20%', padding: '1rem' }}>
                        {loading && <p>Loading posts...</p>}
                        {activeReports.length > 0 ? (
                            <Box>
                                {activeReports.map((post) => (
                                    <Card key={post.id} sx={{ marginBottom: '1rem', width: 300, height: '50%', objectFit: 'cover' }}>
                                        <Box sx={{ backgroundColor: 'black', color: 'white', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CardActions onClick={() => handleProfile(post?.owner.username)} sx={{ cursor: 'pointer' }}>
                                                    <Avatar alt="User" src={"/savvy.png"} sx={{ width: 64, height: 64 }} />
                                                    <Typography variant="h6">{post.owner.username || 'Username'}</Typography>
                                                </CardActions>
                                            </Box>
                                        </Box>
                                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                            <CardActionArea onClick={() => handlePostClick(post)}>
                                                <CardMedia
                                                    component="img"
                                                    image={post.s3_urls[postImages.find(p => p.postId === post.id)?.imageIndex ?? 0]}
                                                    alt="Image"
                                                    sx={{ width: 300, height: 300, objectFit: 'fill' }}
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
                                                    onClick={() => handleNextImage(post.id, false)}
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
                                            <CardActions>
                                                <Button variant="contained" onClick={() => handleBan(post)}>Ban</Button>
                                            </CardActions>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        ) : (
                            <Typography>No posts found.</Typography>
                        )}
                        {hasMoreReports && (
                            <Button onClick={() => loadMorePosts(false)} disabled={loading}>Load More</Button>
                        )}   
                    </Box>
                </>
            );
        case "bannedPosts":
            return (
                <>
                    <h2 className={styles.sectionTitle}>Banned Posts</h2>
                    <Box sx={{ marginLeft: '20%', padding: '1rem' }}>
                        {loading && <p>Loading posts...</p>}
                        {bannedPosts.length > 0 ? (
                            <Box>
                                {bannedPosts.map((post) => (
                                    <Card key={post.id} sx={{ marginBottom: '1rem', width: 300, height: '50%', objectFit: 'cover' }}>
                                        <Box sx={{ backgroundColor: 'black', color: 'white', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CardActions onClick={() => handleProfile(post?.owner.username)} sx={{ cursor: 'pointer' }}>
                                                    <Avatar alt="User" src={"/savvy.png"} sx={{ width: 64, height: 64 }} />
                                                    <Typography variant="h6">{post.owner.username || 'Username'}</Typography>
                                                </CardActions>
                                            </Box>
                                        </Box>
                                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                            <CardActionArea onClick={() => handlePostClick(post)}>
                                                <CardMedia
                                                    component="img"
                                                    image={post.s3_urls[postImages.find(p => p.postId === post.id)?.imageIndex ?? 0]}
                                                    alt="Image"
                                                    sx={{ width: 300, height: 300, objectFit: 'fill' }}
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
                                                    onClick={() => handleNextImage(post.id, true)}
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
                                            <CardActions>
                                                <Button variant="contained" onClick={() => handleUnban(post)}>Unban</Button>
                                            </CardActions>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        ) : (
                            <Typography>No posts found.</Typography>
                        )}
                        {hasMoreBans && (
                            <Button onClick={() => loadMorePosts(true)}  disabled={loading}>Load More</Button>
                        )}   
                    </Box>
                </>
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Account Settings</h1>
                <p className={styles.description}>Manage your account, preferences, and privacy</p>
            </div>

            <div className={styles.settingsLayout}>
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

                <main className={styles.settingsMain}>{renderSection()}</main>
            </div>
        </div>
    );
}