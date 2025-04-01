"use client";

import styles from "@/styles/Discover.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import axios from "axios";
import debounce from "lodash.debounce";

interface GenreOption {
    id: string;
    genre: string;
}

interface InstrumentOption {
    id: string;
    instrument: string;
    class_name: string;
}

interface Instrument {
    id: string;
    instrument: string;
    years_played: string;
}

interface Genre {
    id: string;
    genre: string;
}

export default function Discover() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading } = useAuth();

    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [instruments, setInstruments] = useState<Instrument[]>([{ id: "", instrument: "", years_played: "" }]);
    const [genres, setGenres] = useState<Genre[]>([{ id: "", genre: "" }]);
    const [autocompleteResultsInstruments, setAutocompleteResultsInstruments] = useState<{[key: number]: InstrumentOption[];}>({});
    const [autocompleteResultsGenre, setAutocompleteResultsGenre] = useState<{[key: number]: GenreOption[];}>({});
    const [instrumentOptions, setInstrumentOptions] = useState<InstrumentOption[]>([]);
    const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);

    // Fetch instruments and genres from the database when the component mounts
    useEffect(() => {
        const fetchInstruments = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/instruments/all/', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setInstrumentOptions(data);
                } else {
                    setError("Failed to load instruments.");
                }
            } catch (error) {
                setError("Error fetching instruments.");
                console.error(error);
            }
        };

        const fetchGenres = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/genres/all/', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setGenreOptions(data);
                } else {
                    setError("Failed to load genres.");
                }
            } catch (error) {
                setError("Error fetching genres.");
            }
        };

        fetchInstruments();
        fetchGenres();
    }, []);

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    // Close both dropdown when clicked outside the menu
    const handleClickOutside = (event: MouseEvent) => {
        setAutocompleteResultsInstruments({});
        setAutocompleteResultsGenre({});
    };

    // Handle dropdown item selection for instruments
    const handleInstrumentDropdownItemClick = (instrument: string) => {
        const selectedInstrument = instrumentOptions.find(inst => inst.instrument.toLowerCase() === instrument.toLowerCase());

        if (selectedInstrument) {
            // Add selected instrument to the list of selected instruments
            setSelectedInstruments((prev) => [...prev, selectedInstrument.instrument]);
        }

        setError("");
        setAutocompleteResultsInstruments({});
    };

    // Handle dropdown item selection for genres
    const handleGenreDropdownItemClick = (genre: string) => {
        const selectedGenre = genreOptions.find(gen => gen.genre.toLowerCase() === genre.toLowerCase());

        if (selectedGenre) {
            // Add selected instrument to the list of selected instruments
            setSelectedGenres((prev) => [...prev, selectedGenre.genre]);
        }

        setError("");
        setAutocompleteResultsGenre({});
    };

    // Function to handle instrument changes
    const handleInstrumentChange = (index: number, value: string) => {
        // Clear the error and prevent updating if the input is empty or already selected
        setError("");
        const newInstruments = [...instruments];
        
        newInstruments[index] = { ...newInstruments[index], instrument: value };

        setInstruments(newInstruments);

        // Filter instrument options based on the user's input
        setAutocompleteResultsInstruments((prev) => ({
            ...prev,
            [index]: instrumentOptions
                .filter((instrument) => instrument.instrument.toLowerCase().startsWith(value.toLowerCase()))
                .slice(0, 5),
        }));
    };

    // Function to handle genre changes
    const handleGenreChange = (index: number, value: string) => {
        setError("");
        const newGenres = [...genres];

        newGenres[index] = { ...newGenres[index], genre: value };

        setGenres(newGenres);

        // Filter genre options based on the user's input
        setAutocompleteResultsGenre((prev) => ({
            ...prev,
            [index]: genreOptions
                .filter((genre) => genre.genre.toLowerCase().startsWith(value.toLowerCase()))
                .slice(0, 5),
        }));
    };

    // Function to remove instrument from selected list
    const removeInstrument = (instrument: string) => {
        setSelectedInstruments((prev) => prev.filter(i => i !== instrument));
    };

    // Function to remove genre from selected list
    const removeGenre = (genre: string) => {
        setSelectedGenres((prev) => prev.filter(i => i !== genre));
    };

    // Fetch users based on filters
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

    return (
        <>
        <Head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        </Head>
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

                {/* Instrument Search Dropdown */}
                {instruments.map((instrument, index) => (
                    <div key={index} className={styles.instrumentRow}>
                        <div className={styles.autocompleteWrapper}>
                            <input
                                type="text"
                                placeholder="Instrument"
                                className={styles.inputField}
                                value={instrument.instrument}
                                onChange={(e) => handleInstrumentChange(index, e.target.value)}
                            />
                            {autocompleteResultsInstruments[index] && autocompleteResultsInstruments[index].length > 0 && (
                                <div className={styles.autocompleteDropdown}>
                                    {autocompleteResultsInstruments[index].map((option, i) => (
                                        <div
                                            key={i}
                                            className={styles.autocompleteItem}
                                            data-testid={`instrument-option-${option.instrument}`}
                                            onClick={() => handleInstrumentDropdownItemClick(option.instrument)}
                                        >
                                            {option.instrument}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Display selected instruments below the search input */}
                <div className={styles.selectedFilters}>
                    {selectedInstruments.map((instrument, index) => (
                        <span key={index} className={styles.selectedItem}>
                            {instrument} 
                            <button onClick={() => removeInstrument(instrument)}> X </button>
                        </span>
                    ))}
                </div>

                {/* Genre Search Dropdown */}
                {genres.map((genre, index) => (
                    <div key={index} className={styles.instrumentRow}>
                        <div className={styles.autocompleteWrapper}>
                            <input
                                type="text"
                                placeholder="Genre"
                                className={styles.inputField}
                                value={genre.genre}
                                onChange={(e) => handleGenreChange(index, e.target.value)}
                            />
                            {autocompleteResultsGenre[index] && autocompleteResultsGenre[index].length > 0 && (
                                <div className={styles.autocompleteDropdown}>
                                    {autocompleteResultsGenre[index].map((option, i) => (
                                        <div
                                            key={i}
                                            className={styles.autocompleteItem}
                                            onClick={() => handleGenreDropdownItemClick(option.genre)}
                                        >
                                            {option.genre}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            )}

            <div className={styles.selectedFilters}>
                {selectedGenres.map((genre, index) => (
                    <span key={index} className={styles.selectedItem}>
                        {genre} 
                        <button onClick={() => removeGenre(genre)}> X </button>
                    </span>
                ))}
            </div>
            
            {/* User List */}
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
    </div>
    </>
    );
}