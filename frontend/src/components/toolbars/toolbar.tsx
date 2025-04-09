"use client";

import { Button, Stack, Box } from "@mui/material";
import { Home, Search, Add, Chat, Settings } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const Toolbar = () => {
    const router = useRouter();

    const handleFeedClick = () => {
        router.push(`/feed/`);
    };
    
    const handleDiscoverClick = () => {
        router.push(`/discover/`);
    };
    
    const handleJobsClick = () => {
        router.push(`//`);
    };
    
    const handleMessagesClick = () => {
        router.push(`//`);
    };
    
    const handleSettingsClick = () => {
        router.push(`settings/user`);
    };

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
            <Button variant="contained" startIcon={<Home />} onClick={handleFeedClick}>Feed</Button>
            <Button variant="contained" startIcon={<Search />} onClick={handleDiscoverClick}>Discover</Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleJobsClick}>Jobs</Button>
            <Button variant="contained" startIcon={<Chat />} onClick={handleMessagesClick}>Messages</Button>
            <Button variant="contained" startIcon={<Settings />} onClick={handleSettingsClick}>Settings</Button>
        </Box>
    );
};

export default Toolbar;