"use client";

import { Button, Box, Avatar } from "@mui/material";
import { Home, Search, Add, Chat, Settings, Assignment } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/ProfileContext";

const Toolbar = () => {
    const router = useRouter();
    const { toggleTheme, theme } = useTheme();
    const { profile, isLoading, setProfile } = useAuth();

    const handleFeedClick = () => {
        router.push(`/feed/`);
    };
    
    const handleDiscoverClick = () => {
        router.push(`/discover/`);
    };
    
    const handleJobsClick = () => {
        router.push(`/feed/job-listing/`);
    };
    
    const handleMessagesClick = () => {
        router.push(`/messages/`);
    };
    
    const handleSettingsClick = () => {
        router.push(`/settings/`);
    };

    const handleAdminClick = () => {
        router.push(`/admin/`)
    }

    const handleProfile = () => {
        if (!profile) return <p className="description">Loading...</p>;
            if (profile.role == "musician")
                router.push(`/${profile?.username}`)
            else
                router.push(`/${profile?.username}/business`)
    }

    const handleAppClick = () => {
        router.push(`/${profile?.username}/applications`)
    }

    return (
        <Box
        sx={{
            position: 'fixed',
            width: '12%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#333',
            color: 'white',
            padding: '1rem 0',
            gap: '1rem',
            boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
            zIndex: 1300
        }}
        >
            <Avatar alt="User" src={"/savvy.png"} sx={{ width: 64, height: 64, cursor: 'pointer' }} onClick={handleProfile}></Avatar>
            <Button variant="contained" startIcon={<Home />} onClick={handleFeedClick}>Feed</Button>
            <Button variant="contained" startIcon={<Search />} onClick={handleDiscoverClick}>Discover</Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleJobsClick}>Jobs</Button>
            {profile?.role === "musician" && (
                <Button variant="contained" startIcon={<Assignment />} onClick={handleAppClick}>
                    My Application
                </Button>
            )}
            <Button variant="contained" startIcon={<Chat />} onClick={handleMessagesClick}>Messages</Button>
            <Button variant="contained" startIcon={<Settings />} onClick={handleSettingsClick}>Settings</Button>
            <Button variant="contained" onClick={handleAdminClick}>Admin</Button>
            <Button aria-label="Toggle Theme" onClick={toggleTheme}>{theme === "light" ? <Moon size={26} /> : <Sun size={26} />}</Button>
        </Box>
    );
};

export default Toolbar;