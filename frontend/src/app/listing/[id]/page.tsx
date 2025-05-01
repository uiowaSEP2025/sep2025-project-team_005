"use client";

import React from 'react';
import { Edit } from 'lucide-react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

//import styles from "@/styles/ViewApplication.module.css";


export default function JobListing() {
    useRequireAuth();

    const router = useRouter();
    const { id } = useParams();
    const { profile, isLoading, setProfile } = useAuth();

    if (!profile) { return <div>Loading...</div>; }

    return (
        <div>
            listing {id}
        </div>
    )
}