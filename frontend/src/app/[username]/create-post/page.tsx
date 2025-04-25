"use client";

import React from 'react';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import styles from "@/styles/CreatePost.module.css";
import { Button, styled } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';


export default function CreateNewPost() {
    useRequireAuth();

    const router = useRouter();
    const { username } = useParams();
    const { profile, isLoading, setProfile } = useAuth();
    const [files, setFiles] = useState<FileList | null>(null);
    const [fileNames, setFileNames] = useState<string[]>([]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            setFiles(selectedFiles);
            setFileNames(Array.from(selectedFiles).map(file => file.name));

            // Need a way to pass image files to the next page (editing page)
            // Convert the uploaded files to base64, storing thm in session storage so they can be accessed on the next page
            const convertedFiles = await Promise.all(
                Array.from(selectedFiles).map(file =>
                    new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(file);
                    })
                )
            );

            // Now that the image files are converted, save them in sessionStorage
            sessionStorage.setItem("uploadedImages", JSON.stringify(convertedFiles));
        }
    };

    const handleContinueToEdit = () => {
        // If no files are uploaded yet, tell user and remain on this page
        if(!files || files.length === 0) {
            alert("Please upload at least one photo before continuing.");
            return;
        }

        // Otherwise, route to the photo editing page
        router.push(`/${username}/create-post/edit`);
    }

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
            <h2 className={styles.featureTitle}>Upload Photos</h2>
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

                {fileNames.length > 0 && (
                    <div className={styles.filelist}>
                        <p>Files uploaded:</p>
                        <ul>
                            {fileNames.map((name, index) =>
                                <li key={index}>{name}</li>)}
                        </ul>
                    </div>
                )}

                <button
                  className={styles.editButton}
                  onClick={handleContinueToEdit}
                  data-testid="edit-button"
                >
                  Continue to Edit
                </button>
              </div>
            )}
          </div>
        </div>
      );
}