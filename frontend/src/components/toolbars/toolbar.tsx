"use client";

import { Button, Box, Avatar } from "@mui/material";
import { Home, Search, Add, Chat, Settings } from "@mui/icons-material";
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
        // router.push(`//`);
    };
    
    const handleMessagesClick = () => {
        // router.push(`//`);
    };
    
    const handleSettingsClick = () => {
        router.push(`/settings/user/`);
    };

    const handleAdminClick = () => {
        router.push(`/admin/`)
    }

    const handleProfile = () => {
        router.push(`/${profile?.username}`)
    }

    return (
        <Box
        sx={{
            position: 'fixed',
            width: '10%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#333', // Replace with global var
            color: 'white', // Replace with global var
            padding: '1rem 0',
            gap: '1rem',
            boxShadow: '2px 0 5px rgba(0,0,0,0.2)', // Add subtle shadow for a floating effect
        }}
        >
            <Avatar alt="User" src={"/savvy.png"} sx={{ width: 64, height: 64, cursor: 'pointer' }} onClick={handleProfile}></Avatar>
            <Button variant="contained" startIcon={<Home />} onClick={handleFeedClick}>Feed</Button>
            <Button variant="contained" startIcon={<Search />} onClick={handleDiscoverClick}>Discover</Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleJobsClick}>Jobs</Button>
            <Button variant="contained" startIcon={<Chat />} onClick={handleMessagesClick}>Messages</Button>
            <Button variant="contained" startIcon={<Settings />} onClick={handleSettingsClick}>Settings</Button>
            <Button variant="contained" onClick={handleAdminClick}>Admin</Button>
            <Button aria-label="Toggle Theme" onClick={toggleTheme}>{theme === "light" ? <Moon size={26} /> : <Sun size={26} />}</Button>
        </Box>
    );
};

export default Toolbar;