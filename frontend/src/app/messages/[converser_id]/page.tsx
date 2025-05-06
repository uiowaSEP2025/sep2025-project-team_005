"use client";

import React from 'react';
import styles from "@/styles/Discover.module.css";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";

import axios from "axios";
import Cookies from "js-cookie";
import Toolbar from '@/components/toolbars/toolbar';
import { Box, Typography, Button, IconButton, Avatar, CardActions } from '@mui/material';
import { ArrowBack, ArrowForward, Message} from '@mui/icons-material';

interface User {
    username: string;
    id: string;
    isFollowing: boolean;
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

export default function Feed() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading, setProfile } = useAuth();
    const { converser_id } = useParams();
    const [converser, setConverser] = useState<User>();
    const [message, setMessage] = useState<string>("");
    const [messages, setMessages] = useState<MessageInterface[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [messageImages, setMessageImages] = useState<{ messageId: string; imageIndex: number }[]>([]);
    const NEXT_PUBLIC_BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API;

    useEffect(() => {
        if (!isLoading && profile) {
            fetchMessages();
        }
    }, [isLoading, profile]);

    useEffect(() => {
        if (messages.length > 0) {
            setMessageImages(
                messages.map(message => ({
                messageId: message.id,
                imageIndex: 0,
                }))
            );
        }
    }, [messages]);

    useEffect(() => {
        fetchConverser();
    }, [profile]);

    const fetchConverser = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/user/`, {
                params: {
                    user_id: converser_id,
                },
            });
            setConverser(response.data);
        } catch (error) {
            console.error("Error fetching converser:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (pageNum = 1) => {
        if (!profile) return;
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/message/get/`, {
                params: {
                    user_id: profile.id,
                    converser_id: converser_id,
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
                setMessages(response.data.results);
            } else {
                setMessages((prevMessages) => [...prevMessages, ...response.data.results]);
            }
            setHasMore(response.data.next !== null);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const sendMessage = async () => {
        if (!profile) return;
        const formData = new FormData();

        try {
            formData.append('sender', String(profile.id));
            formData.append('receiver', String(converser_id));
            formData.append('message', String(message));
            
            // for (let i = 0; i < files.length; i++) {
            //     formData.append('files', files[i]);
            // }

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/api/message/create/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        "Authorization": `Bearer ${Cookies.get("access_token")}`
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                setMessages((prevMessages) => [response.data.message_object, ...prevMessages]);
                setMessage('');
                console.log("Request successful:", response.data);
            } else {
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error messaging: ", error);
        }
    };

    const loadMoreMessages = () => {
        if (hasMore && !loading) {
            fetchMessages(page + 1);
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handleNextImage = (messageId: string) => {
        setMessageImages((prevImages) => 
            prevImages.map((message) => {
                const currentMessage = messages.find((message) => message.id === messageId);
    
                if (message.messageId === messageId && currentMessage) {
                    return {
                        ...message,
                        imageIndex: Math.min(message.imageIndex + 1, currentMessage.s3_urls.length - 1),
                    };
                }
                return message;
            })
        );
    };

    const handlePreviousImage = (messageId: string) => {
        setMessageImages((prevImages) => 
            prevImages.map((message) => {    
                if (message.messageId === messageId) {
                    return {
                        ...message,
                        imageIndex: Math.max(message.imageIndex - 1, 0),
                    };
                }
                return message;
            })
        );
    };

    const handleProfile = async (username: string) => {
        router.push(`/${username}`)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage();
      };

    if (isLoading) return <p className="description">Loading...</p>;

    return (
        <Box>
            <Toolbar />    
            <Box sx={{ marginLeft: '20%', padding: '1rem' }}>
                <CardActions onClick={() => converser?.username && handleProfile(converser.username)} sx={{ cursor: 'pointer' }}>
                    <Avatar alt="User" src={"/savvy.png"} sx={{ width: 64, height: 64 }} />
                    <Typography variant="h4">{converser?.username ?? "Unknown User"}</Typography>
                </CardActions>
                {loading && <p>Loading messages...</p>}
                {hasMore && (
                    <Button onClick={loadMoreMessages} disabled={loading}>Load More</Button>
                )}
                {messages.length > 0 ? (
                    <Box display="flex" flexDirection="column-reverse" height="100%" overflow="auto">
                        {messages.map((message) => (
                            <Box
                                display="flex"
                                justifyContent={message.sender.id != converser_id ? 'flex-end' : 'flex-start'}
                                mb={1}
                            >
                                <Box
                                  px={2}
                                  py={1}
                                  bgcolor={message.sender.id != converser_id ? 'primary.main' : 'grey.300'}
                                  color={message.sender.id != converser_id ? 'white' : 'black'}
                                  borderRadius={2}
                                  maxWidth="70%"
                                  sx={{
                                    borderTopLeftRadius: message.sender.id != converser_id ? 16 : 0,
                                    borderTopRightRadius: message.sender.id != converser_id ? 0 : 16,
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                    <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {message.message}
                                    </Typography>
                                    {/* {messageImages.find(p => p.messageId === message.id)?.imageIndex !== 0 && (
                                        <Button
                                            onClick={() => handlePreviousImage(message.id)}
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

                                    {messageImages.find(p => p.messageId === message.id)?.imageIndex !== message.s3_urls.length - 1 && (
                                        <Button
                                            onClick={() => handleNextImage(message.id)}
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
                                    )} */}
                                </Box>
                            </Box>
                        ))}
                    </Box>       
                ) : (
                    <Typography>No messages found.</Typography>
                )}
                <form onSubmit={handleSubmit}>
                    <Box className={styles.searchContainer} display="flex" alignItems="center">
                        <input
                            className={styles.searchInput}
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <IconButton color="primary" onClick={sendMessage} sx={{ ml: 1 }}>
                            <Message />
                        </IconButton>
                    </Box>
                </form>
                <Typography variant="h6">{500 - message.length}</Typography>
            </Box>
        </Box>
    );
}