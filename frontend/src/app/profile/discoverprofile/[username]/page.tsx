"use client";

import { useParams } from 'next/navigation';

export default function DiscoverProfile() {
    const { username } = useParams();

    return (
        <div>
            <h1>Profile of {username}</h1>
            <p>Profile Details</p>
        </div>
    );
}
