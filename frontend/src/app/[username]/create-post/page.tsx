"use client";

import React from 'react';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import styles from "@/styles/CreatePost.module.css";
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
    const [files, setFiles] = useState<FileList | null>(null);
    const [caption, setCaption] = useState("");

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFiles(event.target.files);
        }
    };

    const handlePost = async () => {
        try {
            const formData = new FormData();
            if (!files || files.length === 0) {
                console.error("Please upload a file");
                return;
            }

            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]);
            }
            formData.append("caption", caption);

            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/post/create/`, formData, {
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
        <div className={styles.centerWrapper}>
          <div className={styles.postsHeader}>
            <h2 className={styles.featureTitle}>Posts</h2>
            {profile?.username === username && (
              <div className={styles.buttonGroup}>
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

                <label className={styles.label}>Caption:</label>
                <input 
                    className={styles.inputField} 
                    placeholder="Caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                >
                </input>

                <button
                  className={styles.editButton}
                  onClick={handlePost}
                  data-testid="post-button"
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
      );
}