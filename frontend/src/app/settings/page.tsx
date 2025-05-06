"use client";

import { useState, useEffect } from "react";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import Cookies from "js-cookie";

import Image from "next/image";
import styles from "@/styles/AccountSettings.module.css";
import { Box, Card, CardActions, CardActionArea, CardContent, CardMedia, Typography, Button, Avatar } from '@mui/material';
import axios from "axios";
import { ArrowBack, ArrowForward, ChatBubbleOutline, ThumbUp, ThumbUpOutlined } from "@mui/icons-material";
import { FaEllipsisV } from "react-icons/fa";
import { blueGrey } from "@mui/material/colors";
import Dropdown from "@/components/menus/dropdown";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    username: string;
    profilePhoto: string;
    isBlocked: boolean;
    isFollowing: boolean;
}

interface Post {
    owner: User;
    id: string;
    created_at: string;
    caption: string;
    s3_urls: string[];
    is_liked: boolean;
    like_count: number;
}

const sections = {
  account: "Account Info",
  blocked: "View Blocked Users",
  liked: "Liked Posts",
};

export default function SettingsPage() {
    useRequireAuth();

    const [activeSection, setActiveSection] = useState<keyof typeof sections>("account");
    const router = useRouter();
    const { profile, isLoading } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);
    const [postPage, setPostPage] = useState(1);
    const [hasMoreLikedPosts, setHasMoreLikedPosts] = useState(true);
    const [expandedPostDescriptions, setExpandedPostDescriptions] = useState<Set<string>>(new Set());
    const [postImages, setLikedPostImages] = useState<{ postId: string; imageIndex: number }[]>([]);
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
        else if (activeSection === "liked") {
            fetchLikedPosts(1);
        }
    }, [activeSection]);

    useEffect(() => {
        if (likedPosts.length > 0) {
            setLikedPostImages(
                likedPosts.map(post => ({
                postId: post.id,
                imageIndex: 0,
                }))
            );
        }
    }, [likedPosts]);

    const loadMoreUsers = () => {
        if (hasMore && !loading) {
            fetchBlockList(page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

    const loadMoreLikedPosts = () => {
        if (hasMoreLikedPosts && !loading) {
            fetchLikedPosts(postPage + 1);
            setPostPage((prevPage) => prevPage + 1);
        }
    };

    const fetchLikedPosts = async (pageNum = 1) => {
        if (!hasMoreLikedPosts || loading || !profile) return;
    
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/fetch-liked-posts/`, {
                params: {
                    user_id: profile.id,
                    page: pageNum
                },
            })
            if (response.status >= 200 && response.status < 300) {
                if (pageNum === 1) {
                    setLikedPosts(response.data.results);
                } else {
                    setLikedPosts((prevPosts) => [...prevPosts, ...response.data.results]);
                }
                setHasMoreLikedPosts(!!response.data.next);
            } else {
                console.error("Failed to fetch liked posts list", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching liked posts list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentClick = async (post: Post) => {
        router.push("") // TODO: replace with route to individual post-comment view
    }

    const handleShareClick = async (post: Post) => {
        router.push("") // TODO: replace with route to individual share view
    }

    const handleLikeToggle = async (post: Post) => {
        if (!post) return;
    
        try {
            let response;
        
            if (post.is_liked) {
                response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/post/like/`, {
                    data: { post_id: post.id },
                    headers: {
                        Authorization: `Bearer ${Cookies.get("access_token")}`,
                    },
                });
            } else {
                response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_API}/api/post/like/`,
                    { post_id: post.id },
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get("access_token")}`,
                        },
                    }
                );
            }
            if (response.status >= 200 && response.status < 300) {
                setLikedPosts(prev =>
                    prev.map(p =>
                        p.id === post.id
                        ? {...p,
                            is_liked: !p.is_liked,
                            like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1}
                        : p
                    )
                );
            } else {
                alert("Like request failed. Please refresh the page and try again.");
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error toggling like status:", error);
        }
    };

    const handlePostClick = async (post: Post) => {
        router.push("") // TODO: replace with route to individual post view
    }

    const handleFollowToggle = async (user: User, isFollowing: boolean) => {
        if(!user) {
            return;
        } try {
            const url = `${process.env.NEXT_PUBLIC_BACKEND_API}/api/follow/${user.id}/`;
            const method = isFollowing ? "delete" : "post";
        
            const response = await axios({
                url,
                method,
                withCredentials: true,
                headers: {
                    "Authorization": `Bearer ${Cookies.get("access_token")}`
                }
            });
            if (response.status >= 200 && response.status < 300) {
                setLikedPosts(prev =>
                    prev.map(post => post.owner.id === user.id
                        ? { ...post, owner: { ...post.owner, isFollowing: !isFollowing } }
                        : post)
                );
            }
        } catch (error) {
            console.error("Error toggling follow status:", error);
        }
    };

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

    const handleProfile = async (username: string) => {
        router.push(`/${username}`)
    }

    const handleNextImage = (postId: string) => {
        setLikedPostImages((prevImages) => 
            prevImages.map((post) => {
                const currentPost = likedPosts.find((post) => post.id === postId);
    
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
        setLikedPostImages((prevImages) => 
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
    
    // Render page based on side bar selection
    const renderSection = () => {
        switch (activeSection) {
        case "account":
            return (
                <>
                    <h2 className={styles.sectionTitle}>Your Account Info</h2>
                    <div className={styles.accountInfo}>
                    <p><strong>Username:</strong> {profile?.username}</p>
                    <p><strong>Email:</strong> {profile?.email}</p>
                    <p><strong>Phone Number:</strong> {profile?.phone}</p>
                    <p><strong>Join Date:</strong> {profile?.created_at}</p>
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
            return (
                <>
                    <Box sx={{ marginLeft: '20%', padding: '1rem' }}>
                        {loading && <p>Loading posts...</p>}
                        {likedPosts.length > 0 ? (
                            <Box>
                                {likedPosts.map((post) => (
                                    <Card key={post.id} sx={{ marginBottom: '1rem', width: '50%', height: '50%', objectFit: 'cover' }}>
                                        <Box sx={{ backgroundColor: 'black', color: 'white', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CardActions onClick={() => handleProfile(post?.owner.username)} sx={{ cursor: 'pointer' }}>
                                                    <Avatar alt="User" src={"/savvy.png"} sx={{ width: 64, height: 64 }} />
                                                    <Typography variant="h6">{post.owner.username || 'Username'}</Typography>
                                                </CardActions>
                                            </Box>
                                            <Box display="flex" gap={1}>
                                                <Button size="small" variant="contained" sx={{backgroundColor: post.owner.isFollowing ? blueGrey[400] : 'primary.main'}} onClick={() => handleFollowToggle(post.owner, post.owner.isFollowing)}>
                                                    {post.owner.isFollowing ? 'Unfollow' : 'Follow'}
                                                </Button>
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
                                            {post.is_liked ? (
                                                <Button onClick={() => handleLikeToggle(post)}><ThumbUp/></Button>
                                            ) : (
                                                <Button onClick={() => handleLikeToggle(post)}><ThumbUp/></Button>
                                            )}
                                            <Button variant="text" onClick={() => router.push(`posts/${post.id}/liked-users/`)}>
                                                {post.like_count}
                                            </Button>
                                            <Button onClick={() => handleCommentClick(post)}><ChatBubbleOutline/></Button>
                                            <Button variant="contained" onClick={() => handleShareClick(post)}>Share</Button>
                                        </CardActions>
                                    </Card>
                                ))}
                            </Box>
                        ) : (
                            <Typography>No posts found.</Typography>
                        )}
                        {hasMoreLikedPosts && (
                            <Button onClick={loadMoreLikedPosts} disabled={loading}>Load More</Button>
                        )}   
                    </Box>
                </>
            )
        default:
            return null;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Account Settings</h1>
                <p className={styles.description}>Manage your account and preferences</p>
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