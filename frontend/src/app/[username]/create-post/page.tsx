"use client";

import React from 'react';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import styles from "@/styles/Profile.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { Router } from 'lucide-react';
import { Button, styled } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

export default function CreateNewPost() {
    useRequireAuth();

    const router = useRouter();
    const { username } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [file, setFile] = useState<File>();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files?.[0]);
        }
    };

    const handlePost = async () => {
        try {
            const formData = new FormData();
            if (!file) {
                console.error("Please upload a file");
                return;
            }
            formData.append("file", file);
            formData.append("caption", "Test");
    
            const response = await axios.post("http://localhost:8000/api/create-post/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${Cookies.get("access_token")}`
                },
                withCredentials: true
            });
            if (response.status >= 200 && response.status < 300) {
                alert("Post created!");
                console.log("Request successful:", response.data);
                router.back();
            } else {
                alert("Post creation failed. Please refresh the page and try again.");
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error(error)
        }
    };

    // Custom component (reference: materialUI)
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

    return (
        <div className={styles.postsHeader}>
            <h2 className={styles.featureTitle}>Posts</h2>
            {profile?.username === username && (
                <div>
                    <button className={styles.editButton} onClick={handlePost} data-testid="post-button">Post</button>
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
                </div>
            )}
        </div>
    );
}