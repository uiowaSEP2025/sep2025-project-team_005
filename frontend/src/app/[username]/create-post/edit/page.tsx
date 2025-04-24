"use client";

import React from 'react';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import styles from "@/styles/CreatePost.module.css";
import pinturaTheme from "@/styles/CreatePost.module.css"
import axios from "axios";
import Cookies from "js-cookie";
import { PinturaEditor } from "@pqina/react-pintura";
import pintura from "@pqina/pintura/pintura.module.css";
import "@pqina/pintura/pintura.css";
import { getEditorDefaults } from "@pqina/pintura";


// Get default properties for photo editor (stickers)
const editorDefaults = getEditorDefaults({
    stickers: [
        "/savvy.png",
        "😎", "😀", "😍", "😂", "🤔", "🙃", "😜", "🤩", "🤗", "😴", 
        "❤️", "💖", "💙", "💕", "✨", "💫", "🔥", "🐶", "🐱", "🌸", 
        "🌻", "🌞", "🌈", "🦄", "🐝", "🎉", "🏆", "🍕", "🎧", "🍩", 
        "🥇", "💎", "🍎", "👋", "✋", "👌", "👍", "✌️", "🙌", "🤞", 
        "🤟", "🍔", "🍦", "🥤", "🧃", "🍉", "🍫", "🎸", "🎻", "🎺",
        "🥁", "🎷", "🎹", "🎼", "🎤", "🎶", "🎵",
    ],
});


export default function EditPhotos() {
    useRequireAuth();

    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [editedImagesMap, setEditedImagesMap] = useState<{ [key: string]: string }>({});

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

                console.log("Loaded images: ", parsedImages);
            }
            catch (error) {
                console.error("Failed to parse uploaded images from the session storage: ", error);
            }
        }
        else {
            console.warn("No uploaded images found in session storage.");
        }
    }, []);

    const getImageToDisplay = () => {
        if (!editedImage) return undefined;
        return editedImagesMap[editedImage] || editedImage;
    }


    return (
        <div className={styles.container}>
            <h1 className={styles.featureTitle}>Edit Photos:</h1>

            {editedImage ? (
                <div style={{ height: "70vh", marginBottom: "2rem" }}>
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
            ) : (
                <p>No image available to edit.</p>
            )}

            {/* Show thumbnails to switch image being edited */}
            {uploadedImages.length > 1 && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {uploadedImages.map((img, idx) => (
                        <img
                            key={idx}
                            src={editedImagesMap[img] || img}
                            alt={`Uploaded ${idx}`}
                            style={{
                                maxWidth: "100px",
                                border: img === editedImage ? "2px solid blue" : "1px solid gray",
                                cursor: "pointer",
                            }}
                            onClick={() => setEditedImage(img)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}