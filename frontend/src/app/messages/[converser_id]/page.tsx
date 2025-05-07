"use client";

import React, { useRef } from 'react';
import styles from "@/styles/Discover.module.css";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";

import axios from "axios";
import Cookies from "js-cookie";
import Toolbar from '@/components/toolbars/toolbar';
import { Box, Typography, Button, IconButton, Avatar, CardActions, styled, CardMedia } from '@mui/material';
import { Add, ArrowBack, ArrowForward, Message} from '@mui/icons-material';

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
    const [files, setFiles] = useState<File[]>([]);
    const [messages, setMessages] = useState<MessageInterface[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [messageImages, setMessageImages] = useState<{ messageId: string; imageIndex: number }[]>([]);
    const [isTyping, setIsTyping] = useState(false);
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
        messages.map(message => {
            return message;
        });
    }, [messageImages]);

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

    const socket = new WebSocket("ws://localhost:8000/ws/chat/room1/");

    const typingTimeoutRef = useRef<number | null>(null);

    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        if (data.type === 'chat_message') {
            setMessages((prevMessages) => {
                const exists = prevMessages.some((msg) => msg.id === data.message_object.id);
                if (exists) return prevMessages;
                return [data.message_object, ...prevMessages];
              });
        } else if (data.type === 'typing') {
            if (data.username !== profile?.username) {
                setIsTyping(true);
        
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
        
                typingTimeoutRef.current = window.setTimeout(() => {
                    setIsTyping(false);
                }, 500);
            }
        }
    };

    function sendWithRetry(socket: WebSocket, data: any, retryDelay = 500, retriesLeft = 5) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        } else if (socket.readyState === WebSocket.CONNECTING && retriesLeft > 0) {
            setTimeout(() => {
                sendWithRetry(socket, data, retryDelay, retriesLeft - 1);
            }, retryDelay);
        } else {
            console.error('WebSocket is not ready after retries. State:', socket.readyState);
        }
    }

    function sendTyping(username: String) {
        sendWithRetry(socket, JSON.stringify({
            type: 'typing',
            username
        }));
    }

    useEffect(() => {
        console.log('WebSocket is not ready after retries. State:', socket.readyState);
        sendTyping(String(profile?.username));
    }, [message]);

    const sendMessage = async () => {
        if (!profile) return;
        const formData = new FormData();

        try {
            formData.append('sender', String(profile.id));
            formData.append('receiver', String(converser_id));
            formData.append('message', String(message));
            
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

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

            sendWithRetry(socket, JSON.stringify({
                type: 'chat_message',
                message_object: response.data.message_object
            }));

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
    
    const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const files = event.target.files ? Array.from(event.target.files).slice(0, 10) : [];
            setFiles(files);
        }
    };

    const handleProfile = async (username: string) => {
        router.push(`/${username}`)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage();
    };

    const VisuallyHiddenInput = styled('input')({
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

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
                        {messages.map((message, index) => {
                            const prevMessage = messages[index - 1];
                            const showTimestamp = !prevMessage || 
                                new Date(prevMessage.created_at).getTime() - new Date(message.created_at).getTime() > 5 * 60 * 1000;

                            const isSameDay = new Date(message.created_at).toDateString() === new Date().toDateString();

                            const timestamp = isSameDay
                                ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(message.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric', 
                                    hour: 'numeric', 
                                    minute: '2-digit'
                                });
                            return (
                                <Box key={message.id}>
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
                                            {message.s3_urls.length > 0 && (
                                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                                    <Box>
                                                        <CardMedia
                                                            component="img"
                                                            image={
                                                                message.s3_urls[
                                                                    messageImages.find(m => m.messageId === message.id)?.imageIndex ?? 0
                                                                ]
                                                            }
                                                            alt="Image"
                                                            sx={{ width: 300, height: 300, objectFit: 'fill' }}
                                                        />

                                                        {messageImages.find(m => m.messageId === message.id)?.imageIndex!== 0 && (
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
                                                        {messageImages.find(m => m.messageId === message.id)?.imageIndex !== message.s3_urls.length - 1 && (
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
                                                        )}
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    {showTimestamp && (
                                        <Typography
                                            display="flex"
                                            justifyContent={message.sender.id != converser_id ? 'flex-end' : 'flex-start'}
                                            mb={1}
                                            variant="caption"
                                        >
                                            {timestamp}
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
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
                        <Button
                            component="label"
                            role={undefined}
                            tabIndex={-1}
                            >
                            <Add />
                            <VisuallyHiddenInput
                                type="file"
                                onChange={(event) => uploadFile(event)}
                                multiple
                            />
                        </Button>
                    </Box>
                    {isTyping && (
                            <Typography variant="caption">{converser?.username} is typing...</Typography>
                    )}
                </form>
                <Typography variant="h6">{500 - message.length}</Typography>
            </Box>
        </Box>
    );    
}