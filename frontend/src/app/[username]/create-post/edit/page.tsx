"use client";

import React from 'react';
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import styles from "@/styles/CreatePost.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import { PinturaEditor } from "@pqina/react-pintura";
import "@pqina/pintura/pintura.css";
import { getEditorDefaults } from "@pqina/pintura";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete'


// Get default properties for photo editor (stickers)
const editorDefaults = getEditorDefaults({
    stickers: [
        "/savvy.png",
        "🎸", "🎻", "🎺", "🥁", "🎷", "🎹", "🎼", "🎤", "🎶", "🎵",
        "😎", "😀", "😍", "😂", "🤔", "🙃", "😜", "🤩", "🤗", "😴", 
        "❤️", "💖", "💙", "💕", "✨", "💫", "🔥", "🐶", "🐱", "🌸", 
        "🌻", "🌞", "🌈", "🦄", "🐝", "🎉", "🏆", "🍕", "🎧", "🍩", 
        "🥇", "💎", "🍎", "👋", "✋", "👌", "👍", "✌️", "🙌", "🤞", 
        "🤟", "🍔", "🍦", "🥤", "🧃", "🍉", "🍫",
    ],
});


export default function EditPhotos() {
    useRequireAuth();
    const router = useRouter();
    const params = useParams();

    const { profile, isLoading } = useAuth();
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [editedImagesMap, setEditedImagesMap] = useState<{ [key: string]: string }>({});
    const [caption, setCaption] = useState<string>("");
    const [followedUsernames, setFollowedUsernames] = useState<string[]>([]);
    const [taggedUsersMap, setTaggedUsersMap] = useState<{ [photoUrl: string]: string[] }>({});
    const editedFilesRef = useRef<{ [key: string]: File }>({});

    useEffect(() => {
        const storedImages = sessionStorage.getItem("uploadedImages");
        if(storedImages) {
            try {
                const parsedImages = JSON.parse(storedImages);
                setUploadedImages(parsedImages);

                // By default, set the first photo into the photo editor
                if (parsedImages.length > 0) {
                    setEditedImage(parsedImages[0]);
                }
            }
            catch (error) {
                console.error("Failed to parse uploaded images from the session storage: ", error);
            }
        }
        else {
            console.warn("No uploaded images found in session storage.");
        }

        // Load followed usernames once profile loads
        if (!isLoading && profile?.id) {
            fetchFollowedUsernames();
        }
    }, []);


    // Fetch only the usernames of the users that the current user is following
    const fetchFollowedUsernames = async () => {
        try {
            // Call lightweight API endpoint for fetching just usernames
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_API}/api/follow-usernames/${profile?.id}/`,
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("access_token")}`,
                    },
                    withCredentials: true,
                }
            );

            // Set followed usernames with the retrieved list
            setFollowedUsernames(response.data)
            console.log("Set following to: ", response.data)
        }
        catch (err) {
            console.error("Failed to load following usernames: ", err)
        }
    }


    // Get image to be edited in Pintura editor
    const getImageToDisplay = () => {
        if (!editedImage) return undefined;
        return editedImagesMap[editedImage] || editedImage;
    }


    // Utility function to determine the users that are not yet tagged in the currently selected photo
    const getAvailableUsersForCurrentPhoto = () => {
        // Remove users that have already been tagged in that particular photo
        const alreadyTagged = taggedUsersMap[editedImage || ""] || []
        return followedUsernames.filter(user => !alreadyTagged.includes(user))
    }


    const handlePost = async () => {
        try {
            if (uploadedImages.length === 0) {
                console.error("Please upload a file");
                return;
            }

            const formData = new FormData();

            for (const originalImg of uploadedImages) {
                const editedUrl = editedImagesMap[originalImg];

                // Check if we are using the orginal image or edits have been made
                if (editedUrl && editedUrl.startsWith("blob:")) {
                    // Fetch blob from blob URL and append
                    const blob = await fetch(editedUrl).then(r => r.blob());
                    const file = new File([blob], "edited-image.jpg", { type: blob.type });
                    formData.append("files", file);
                } else {
                    // Original image
                    const blob = await fetch(originalImg).then(r => r.blob());
                    const file = new File([blob], "original-image.jpg", { type: blob.type });
                    formData.append("files", file);
                }
            }

            formData.append("caption", caption);

            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/post/create/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${Cookies.get("access_token")}`,
                },
                withCredentials: true
            });

            if (response.status >= 200 && response.status < 300) {
                alert("Post created!");
                console.log("Request successful:", response.data);
                router.push(`/${params.username}`);
            } else {
                alert("Post creation failed. Please refresh the page and try again.");
                console.error("Request failed:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error posting image:", error);
        }
    };


    return (
        <div className={styles.container}>
            <h1 className={styles.featureTitle}>Edit Photos:</h1>

            {editedImage ? (
                <div className={styles.sideBySideContainer}>

                    <div className={styles.thumbnailColumn}>
                        {uploadedImages.map((img, idx) => (
                            <img
                                key={idx}
                                src={editedImagesMap[img] || img}
                                alt={`Uploaded ${idx}`}
                                className={styles.thumbnailImage}
                                onClick={() => setEditedImage(img)}
                            />
                        ))}
                    </div>

                    <div className={styles.editorWrapper}>
                        <PinturaEditor
                            {...editorDefaults}
                            className={`pintura-editor-wrapper`}
                            src={getImageToDisplay()}
                            imageCropAspectRatio={1}
                            onLoad={() => console.log("Loaded image into editor")}
                            onProcess={({ dest }) => {
                                const editedUrl = URL.createObjectURL(dest);
                                setEditedImagesMap((prev) => ({
                                    ...prev,
                                    [editedImage]: editedUrl,
                                }));
                                console.log(`Saved edited version of ${editedImage}`);
                            }}
                        />
                    </div>

                    <div className={styles.postsHeader}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label} htmlFor="caption">Caption:</label>
                            <textarea
                                id="caption"
                                className={styles.inputField}
                                placeholder="Write a caption..."
                                rows={4}
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            ></textarea>
                        </div>

                        <div className={styles.inputGroup} style={{ marginTop: "1rem" }}>
                            <label className={styles.label} htmlFor="tags">Tag users:</label>
                            <Autocomplete
                                disablePortal
                                options={getAvailableUsersForCurrentPhoto()}
                                onChange={(event, newValue) => {
                                    if (!newValue) return;
                                    setTaggedUsersMap(prev => {
                                        const current = prev[editedImage || ""] || [];
                                        return {
                                            ...prev,
                                            [editedImage || ""]: [...current, newValue]
                                        };
                                    });
                                }}
                                renderInput={(params) => <TextField {...params} label="Tag users..." />}
                            />
                            
                            {/* Show currently tagged users for this image */}
                            <div className={styles.taggedUsersList}>
                                {(taggedUsersMap[editedImage || ""] || []).map((user, idx) => (
                                    <div key={idx} className={styles.taggedUser}>{user}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className={styles.editButton} onClick={handlePost} data-testid="post-button">Post</button>

                </div>
            ) : (
                <p>No image available to edit.</p>
            )}
        </div>
    );
}