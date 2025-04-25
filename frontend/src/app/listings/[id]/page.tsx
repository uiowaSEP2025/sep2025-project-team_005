"use client";

import React from 'react';
import { Edit } from 'lucide-react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import Image from "next/image";
import Toolbar from '@/components/toolbars/toolbar';

import styles from "@/styles/Profile.module.css";
import axios from "axios";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import Dropdown from '@/components/menus/dropdown';
import { Button, styled } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface UserID {
    user_id: string;
}

interface JobListing {
    id: number;
    event_title: string;
    venue: string;
    event_description: string;
    gig_type: string;
    payment_type: string;
    payment_amount: string;
    created_at: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    recurring_pattern: string;
    experience_level: string;
    instruments: { id: number; instrument: string }[];
    genres: { id: number; genre: string }[];
}

export default function JobListing() {
    useRequireAuth();

    return (
        <div>
            listing page
        </div>
    )
}