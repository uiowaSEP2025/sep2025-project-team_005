"use client";

import styles from "@/styles/Discover.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import axios from "axios";
import debounce from "lodash.debounce";

export default function Discover() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [instruments, setInstruments] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch available instruments and genres
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [instrumentRes, genreRes] = await Promise.all([
                    axios.get("http://localhost:8000/api/instruments/"),
                    axios.get("http://localhost:8000/api/genres/"),
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
            const response = await axios.get("http://localhost:8000/api/discover/", {
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
            setPage((prevPage) => prevPage + 1);
        }
    };

    const handleUserClick = (username: string) => {
        router.push(`/${username}/`);
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
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Discover Musicians</h1>
                <p className={styles.description}>Search for musicians and connect with them.</p>
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search usernames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
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
            </div>

            {loading && <p>Loading users...</p>}

            <ul className={styles.userList}>
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <li key={index} className={styles.userCard} onClick={() => handleUserClick(user)}>
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
