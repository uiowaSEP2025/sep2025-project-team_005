"use client";

import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";

export default function DiscoverProfile() {
    useRequireAuth();
    
    const router = useRouter();
    const { profile, isLoading } = useAuth();
    const { username } = useParams();

    return (
        <div>
            <h1>Profile of {username}</h1>
            <p>Profile Details</p>
        </div>
    );
}
