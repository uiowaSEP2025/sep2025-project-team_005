"use client";

import styles from "@/styles/Discover.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
=======
import { useAuth, useRequireAuth } from "@/context/ProfileContext"
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
import axios from "axios";
import debounce from "lodash.debounce";

export default function Discover() {
<<<<<<< HEAD
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [instruments, setInstruments] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
=======
    //useRequireAuth();
    
    const router = useRouter();
    const { profile, isLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

<<<<<<< HEAD
    // Fetch available instruments and genres
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [instrumentRes, genreRes] = await Promise.all([
                    axios.get("http://localhost:8000/instruments/"),
                    axios.get("http://localhost:8000/genres/"),
                ]);
                setInstruments(instrumentRes.data);
                setGenres(genreRes.data);
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };

        fetchFilters();
    }, []);

    // Fetch musicians based on filters
    const fetchUsers = async (query = "", selectedInstruments: string[], selectedGenres: string[], pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8000/discover/", {
                params: {
                    search: query,
                    instrument: selectedInstruments,
                    genre: selectedGenres,
                    page: pageNum
                },
                paramsSerializer: params => {
                    const searchParams = new URLSearchParams();
                    Object.keys(params).forEach(key => {
                        if (Array.isArray(params[key])) {
                            params[key].forEach(val => searchParams.append(key, val));
                        } else {
                            searchParams.append(key, params[key]);
                        }
                    });
                    return searchParams.toString();
                }
=======
    // Fetch users from the backend
    const fetchUsers = async (query = "", pageNum = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/create/`, {
                params: { search: query, page: pageNum }
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
            });

            if (pageNum === 1) {
                setUsers(response.data.results);
            } else {
                setUsers((prevUsers) => [...prevUsers, ...response.data.results]);
            }

            setHasMore(response.data.next !== null);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    const debouncedFetchUsers = debounce((query, instruments, genres) => {
        setPage(1);
        fetchUsers(query, instruments, genres, 1);
    }, 300);

    useEffect(() => {
        debouncedFetchUsers(searchTerm, selectedInstruments, selectedGenres);
        return () => debouncedFetchUsers.cancel();
    }, [searchTerm, selectedInstruments, selectedGenres]);

    const loadMoreUsers = () => {
        if (hasMore && !loading) {
            fetchUsers(searchTerm, selectedInstruments, selectedGenres, page + 1);
=======
    // Debounce search to prevent excessive API calls
    const debouncedFetchUsers = debounce((query) => {
        setPage(1);
        fetchUsers(query, 1);
    }, 300);

    // Run when searchTerm changes
    useEffect(() => {
        debouncedFetchUsers(searchTerm);
        return () => debouncedFetchUsers.cancel();
    }, [searchTerm]);

    // Infinite Scroll (Load More)
    const loadMoreUsers = () => {
        if (hasMore && !loading) {
            fetchUsers(searchTerm, page + 1);
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
            setPage((prevPage) => prevPage + 1);
        }
    };

<<<<<<< HEAD
    const handleUserClick = (username: string) => {
        router.push(`/profile/discoverprofile/${username}`);
    };

    const toggleInstrumentSelection = (instrument: string) => {
        setSelectedInstruments(prev => prev.includes(instrument)
            ? prev.filter(i => i !== instrument)
            : [...prev, instrument]);
    };

    const toggleGenreSelection = (genre: string) => {
        setSelectedGenres(prev => prev.includes(genre)
            ? prev.filter(g => g !== genre)
            : [...prev, genre]);
=======
    // Navigate to selected user profile
    const handleUserClick = (username: string) => {
        router.push(`/discoverprofile/${username}`);
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Discover Musicians</h1>
<<<<<<< HEAD
                <p className={styles.description}>Search for musicians and connect with them.</p>
=======
                <p className={styles.description}>
                    Search for musicians and connect with them.
                </p>
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search usernames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
<<<<<<< HEAD
                
                {/* Instrument Dropdown */}
                <div className={styles.dropdown}>
                    <button className={styles.dropdownButton}>Filter by Instrument</button>
                    <div className={styles.dropdownContent}>
                        {instruments.map((instrument, index) => (
                            <label key={index} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={selectedInstruments.includes(instrument)}
                                    onChange={() => toggleInstrumentSelection(instrument)}
                                />
                                {instrument}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Genre Dropdown */}
                <div className={styles.dropdown}>
                    <button className={styles.dropdownButton}>Filter by Genre</button>
                    <div className={styles.dropdownContent}>
                        {genres.map((genre, index) => (
                            <label key={index} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={selectedGenres.includes(genre)}
                                    onChange={() => toggleGenreSelection(genre)}
                                />
                                {genre}
                            </label>
                        ))}
                    </div>
                </div>
=======
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
            </div>

            {loading && <p>Loading users...</p>}

            <ul className={styles.userList}>
                {users.length > 0 ? (
                    users.map((user, index) => (
<<<<<<< HEAD
                        <li key={index} className={styles.userCard} onClick={() => handleUserClick(user)}>
=======
                        <li key={index} className={styles.userCard} onClick={() => handleUserClick(user)}
                        style={{ cursor: "pointer" }}>
>>>>>>> Profile search is functional at /discover, authentication requirement has been commented out for dev. This page will pull up the first 5 profiles in the db, and then load 5 more if the user clicks "Load More". Searching will dynamically query db and when you click on a user it will rout to "discoverprofile/username" which will be the future UI of another users profile.
                            {user}
                        </li>
                    ))
                ) : (
                    <p>No users found.</p>
                )}
            </ul>

            {hasMore && (
                <button onClick={loadMoreUsers} disabled={loading}>
                    Load More
                </button>
            )}
        </div>
    );
}
