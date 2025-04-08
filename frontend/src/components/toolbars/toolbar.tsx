"use client";

import { Button, Stack, Box } from "@mui/material";
import { Home, Search, Add, Chat, Settings } from "@mui/icons-material";

const Toolbar = () => {
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
            <Button variant="contained" startIcon={<Home />}>Feed</Button>
            <Button variant="contained" startIcon={<Search />}>Discover</Button>
            <Button variant="contained" startIcon={<Add />}>Jobs</Button>
            <Button variant="contained" startIcon={<Chat />}>Messages</Button>
            <Button variant="contained" startIcon={<Settings />}>Settings</Button>
        </Box>
    );
};

export default Toolbar;