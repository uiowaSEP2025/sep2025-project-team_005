"use client";

import React from 'react';
import { Edit } from 'lucide-react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import Image from "next/image";
import Toolbar from '@/components/toolbars/toolbar';

import styles from "@/styles/Profile.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import Dropdown from '@/components/menus/dropdown';
import { Button, styled } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

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
    id: string;
    created_at: string;
    caption: string;
    s3_urls: string[];
}

export default function DiscoverProfile() {
    useRequireAuth();

    const router = useRouter();
    const { username } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [musicianProfile, setMusicianProfile] = useState<MusicianProfile | null>(null);
    const [followCount, setFollowCount] = useState<FollowCount | null>(null);
    const [userId, setUserId] = useState<UserID | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [files, setFiles] = useState<File[]>();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            if (!username) return; // Ensure username is available

            try {
                const response = await fetch(`https://savvy-note.com/api/user/${username}/`, {
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

    // Fetch Musician Profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId || !profile) return;
            try {
                const response = await fetch(`https://savvy-note.com/api/musician/${userId.user_id}/`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("access_token")}`
                    }
                });

                if (response.status === 403) {
                    alert("The page you are trying to access doesn't axist");
                    router.push(`/${profile.username}/`);
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setMusicianProfile(data);
                } else {
                    console.error("Failed to fetch musician profile", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching musician profile:", error);
            }
        };

        fetchProfile();
    }, [userId]);

    // Fetch Follow Count
    useEffect(() => {
        const fetchFollowCount = async () => {
            if (!userId) return;
            try {
                const response = await fetch(`https://savvy-note.com/api/follower/${userId.user_id}/`, {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    setFollowCount(data);
                } else {
                    console.error("Failed to fetch follow count", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching follow count:", error);
            }
        };

        fetchFollowCount();
    }, [userId]);

    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!userId || !profile || userId.user_id === String(profile.id)) return;
    
            try {
                const response = await fetch(`https://savvy-note.com/api/is-following/${userId.user_id}/`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("access_token")}`
                    }
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setIsFollowing(data.is_following);
                } else {
                    console.error("Failed to fetch follow status");
                }
            } catch (error) {
                console.error("Error fetching follow status:", error);
            }
        };
    
        fetchFollowStatus();
    }, [userId, profile]);    
    
    const handleFollowToggle = async () => {
        if (!userId) return;
    
        try {
            const response = await fetch(`https://savvy-note.com/api/follow/${userId.user_id}/`, {
                method: isFollowing ? "DELETE" : "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${Cookies.get("access_token")}`
                }
            });
    
            if (response.ok) {
                setIsFollowing(prev => !prev);
                setFollowCount(prev => prev ? {
                    ...prev,
                    follower_count: prev.follower_count + (isFollowing ? -1 : 1)
                } : prev);
            } else {
                console.error("Failed to toggle follow status");
            }
        } catch (error) {
            console.error("Error toggling follow status:", error);
        }
    };    

    const handleUpdateProfile = async () =>  {
        try {
            router.push("/settings");
        } catch (error) {
            console.error(error)
        }
    }

    const handleSettings = async () => {
        try {
            router.push("/settings");
        } catch (error) {
            console.error(error)
        }
    }

    const handleLogout = async () => {
        try {
            await axios.post("https://savvy-note.com/api/auth/logout/", {
                credentials: "include",
            });

            // Clear stored token
            Cookies.remove("access_token");

            // Clear user profile data
            setProfile(null);


            // Redirect to login page
            router.push("/login");
        } 
        catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleBlockUser = async () => {
        if (!userId) return;
    
        try {
            const response = await fetch(`https://savvy-note.com/api/block/${userId.user_id}/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Authorization": `Bearer ${Cookies.get("access_token")}`,
                },
            });
    
            if (response.ok) {
                alert("User blocked.");
            } else {
                console.error("Failed to block user.");
            }
        } catch (error) {
            console.error("Error blocking user:", error);
        }
    };    

    const handlePost = async () => {
        try {
            const formData = new FormData();
            if (!files) {
                console.error("Please upload a file");
                return;
            }
            files.forEach((file) => {
                formData.append("files", file);
            });
            formData.append("caption", "Test".repeat(100));
    
            const response = await axios.post("https://savvy-note.com/api/post/create/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${Cookies.get("access_token")}`
                },
                withCredentials: true
            });
            if (response.status >= 200 && response.status < 300) {
                alert("Post created!");
                console.log("Request successful:", response.data);
            } else {
                alert("Post creation failed. Please refresh the page and try again.");
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error(error)
        }
    };

    const handleNavigation = (user_id: string, type: "followers" | "following") => {
        router.push(`/follow/${user_id}?type=${type}`);
    };

    const fetchPosts = async (username: string, pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get('https://savvy-note.com/api/post/fetch/', {
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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const files = event.target.files ? Array.from(event.target.files).slice(0, 10) : [];
            setFiles(files);
        }
    };

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    if (isLoading || !musicianProfile || !followCount) return <p className="description">Loading...</p>;

    return (
        <div>
            <Toolbar />
            <div className={styles.container}>
                <div className={styles.profileHeader}>
                    <Image 
                        src="/savvy.png" 
                        alt={`${username}'s profile picture`} 
                        width={130} 
                        height={130} 
                        className={styles.profilePhoto}
                    />
                    <div className={styles.profileInfo}>
                        <div className={styles.headerWithDots}>
                            <h1 className={styles.title}>{musicianProfile.stage_name || username}</h1>
                            <Dropdown 
                                buttonLabel={<FaEllipsisV size={24} />} 
                                data-testid="dropdown-button"
                                sx={{ 
                                    position: 'absolute', 
                                    right: 0, 
                                    cursor: 'pointer', 
                                }}
                                menuItems={[
                                    profile?.username === username ? { label: "Settings", onClick: handleSettings } : null,
                                    profile?.username === username ? { label: "Logout", onClick: handleLogout } : null,
                                    profile?.username !== username ? { label: "Block User", onClick: handleBlockUser } : null,
                                ]}
                            >
                            </Dropdown>
                        </div>

                        <div className={styles.followStats}>
                            <div className={styles.statCard}>
                                <button className={styles.statNumber} onClick={() => userId && handleNavigation(userId.user_id, "followers")}>{followCount.follower_count}</button>
                                <p className={styles.statLabel}>Followers</p>
                            </div>
                            <div className={styles.statCard}>
                            <button className={styles.statNumber} onClick={() => userId && handleNavigation(userId.user_id, "following")}>{followCount.following_count}</button>
                                <p className={styles.statLabel}>Following</p>
                            </div>
                        </div>
                        {profile?.username !== username && isFollowing !== null && (
                            <div className={styles.profileActions}>
                            <button 
                                className={isFollowing ? styles.unfollowButton : styles.followButton}
                                onClick={handleFollowToggle}
                                data-testid="follow-button"
                            >
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button>                                
                            <button className={styles.messageButton} data-testid="message-button">Message</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.bioSection}>
                    {profile?.username === username && (
                        <button className={styles.editButton} onClick={handleUpdateProfile} data-testid="edit-button"><Edit size={24}/></button>
                    )}
                    <h2 className={styles.bioTitle}>About</h2>
                    <p className={styles.description}><strong>Home Studio:</strong> {musicianProfile.home_studio ? "Yes" : "No"}</p>
                    <p className={styles.description}><strong>Genres:</strong> {musicianProfile.genres.join(", ")}</p>
                    <p className={styles.description}>
                        <strong>Instruments: </strong>
                        <span>
                            {musicianProfile.instruments.map((instr, index) => (
                                <React.Fragment key={index}>
                                    {instr.instrument_name} - {instr.years_played} years
                                    {index < musicianProfile.instruments.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </span>
                    </p>
                </div>
                
                <div className={styles.postsSection}>
                    <div className={styles.postsHeader}>
                        <h2 className={styles.featureTitle}>Posts</h2>
                        {profile?.username === username && (
                            <div>
                                <button className={styles.editButton} onClick={handlePost} data-testid="post-button">Post</button>
                            </div>
                        )}
                    </div>
                    <div className={styles.postsHeader}>
                    {/* TODO: remove upon post creation */}
                    {profile?.username === username && (
                        <div>
                            <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUpload />}
                                >
                                Upload files
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={(event) => handleFileUpload(event)}
                                    multiple
                                />
                            </Button>
                        </div>
                    )}
                    </div>
                    {loading && <p>Loading posts...</p>}
                    {posts.length > 0 ? (
                        <div className={styles.postsGrid}>
                            {posts.map((post) => (
                                <div key={post.id} className={styles.imageContainer} onClick={() => handlePostClick(post)}>
                                    {post.s3_urls.map((s3_url, index) => (
                                        <img key={index} src={s3_url} alt={post.caption} />
                                    ))}                                    
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No posts found.</p>
                    )}
                    {hasMore && (
                        <button onClick={loadMorePosts} disabled={loading}>
                            Load More
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}