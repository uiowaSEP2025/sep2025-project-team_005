"use client";

import styles from "@/styles/JobListing.module.css";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import axios from "axios";

interface GenreOption {
    id: string;
    genre: string;
}

interface InstrumentOption {
    id: string;
    instrument: string;
    class_name: string;
}

export default function CreateJobListing() {
    useRequireAuth();

    const router = useRouter();
    const { profile, isLoading, setProfile } = useAuth();
    const [error, setError] = useState("");
    const [venue, setVenue] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [payment, setPayment] = useState("Fixed amount");
    const [paymentAmount, setPaymentAmount] = useState("");    
    const [eventDescription, setEventDescription] = useState("");
    const [eventTitle, setEventTitle] = useState("");
    const [gigType, setGigType] = useState("oneTime");
    const [oneTimeDate, setOneTimeDate] = useState("");
    const [oneTimeStart, setOneTimeStart] = useState("");
    const [oneTimeEnd, setOneTimeEnd] = useState("");
    const [recurringDates, setRecurringDates] = useState("");
    const [recurringTimes, setRecurringTimes] = useState("");
    const [recurringPattern, setRecurringPattern] = useState("weekly");
    const [longTermStart, setLongTermStart] = useState("");
    const [longTermEnd, setLongTermEnd] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [experienceLevel, setExperienceLevel] = useState("");
    const [instruments, setInstruments] = useState([{ id: "", instrument: "" }]);
    const [genres, setGenres] = useState([{ id: "", genre: "" }]);
    const [instrumentOptions, setInstrumentOptions] = useState<InstrumentOption[]>([]);
    const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);
    const [autocompleteResultsInstruments, setAutocompleteResultsInstruments] = useState<{
            [key: number]: InstrumentOption[];
        }>({});
    const [autocompleteResultsGenre, setAutocompleteResultsGenre] = useState<{
        [key: number]: GenreOption[];
    }>({});
    
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
    }

     // Fetch instruments and genres from the database when the component mounts
    useEffect(() => {
        // Fetch instrument options
        const fetchInstruments = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/instruments/all/`, {
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

        // Fetch genre options
        const fetchGenres = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/genres/all/`, {
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

    // Function to handle instrument changes
    const handleInstrumentChange = (index: number, value: string, isSelection = false) => {
        const instrumentNames = instruments.map((inst) => inst.instrument.toLowerCase());

        // Prevent duplicate selection
        if (instrumentNames.includes(value.toLowerCase()) && instruments[index].instrument !== value) {
            setError("You have already selected this instrument.");
            return;
        }

        setError(""); // Clear error if valid
        const newInstruments = [...instruments];

        // Find the instrument object from the instrument options based on the name
        const selectedInstrument = instrumentOptions.find(inst => inst.instrument.toLowerCase() === value.toLowerCase());    

        if (selectedInstrument) {
            newInstruments[index] = { id: selectedInstrument.id, instrument: value };
        } else {
            newInstruments[index].instrument = value;
        }

        setInstruments(newInstruments);

        // Filter instrument options based on the user's input
        setAutocompleteResultsInstruments((prev) => ({
            ...prev,
            [index]: instrumentOptions
            .filter((instrument) => instrument.instrument.toLowerCase().startsWith(value.toLowerCase()))
                .slice(0, 5),
        }));
    };


    // Handle dropdown item selection
    const handleInstrumentDropdownItemClick = (index: number, instrument: string) => {
        const isDuplicate = instruments.some((inst) => inst.instrument === instrument);
        if (isDuplicate) {
            setError("You have already selected this instrument.");
            return;
        }

        // Find the instrument from the instrument options
        const selectedInstrument = instrumentOptions.find(inst => inst.instrument.toLowerCase() === instrument.toLowerCase());

        // If the selection is not null/undefined, update the instrument fields
        if(selectedInstrument) {
            const newInstruments = [...instruments];
            newInstruments[index] = { 
                instrument: selectedInstrument.instrument, 
                id: selectedInstrument.id, 
            };
            setInstruments(newInstruments);
        }

        // Clear error and hide dropdown after selection
        setError("");
        setAutocompleteResultsInstruments((prev) => ({ ...prev, [index]: [] }));
    };

    // Add a new instrument field
    const addInstrumentField = () => {
        // Prevent adding a duplicate instrument
        const instrumentNames = instruments.map((inst) => inst.instrument.toLowerCase());
        if (instrumentNames.includes("")) {
            setError("Please fill out the current instrument field before adding another.");
            return;
        }

        setInstruments([...instruments, { id: "", instrument: "" }]);
        setError(""); // Clear error if successful
    };

    const removeInstrumentField = (index: number) => {
        if (instruments.length > 1) {
            const newInstruments = instruments.filter((_, i) => i !== index);
            setInstruments(newInstruments);
        }
    };

    // Function to handle genre input change
    const handleGenreChange = (index: number, value: string) => {
        const genreNames = genres.map((genre) => genre.genre.toLowerCase());

        // Prevent duplicate genre selection
        if (genreNames.includes(value.toLowerCase()) && genres[index].genre !== value) {
            setError("You have already selected this genre.");
            return;
        }

        setError(""); // Clear error if valid
        const newGenres = [...genres];

        // Find the genre object from the genre options based on the name
        const selectedGenre = genreOptions.find(genre => genre.genre.toLowerCase() === value.toLowerCase());

        if (selectedGenre) {
            newGenres[index] = { id: selectedGenre.id, genre: value };
        } else {
            newGenres[index].genre = value;
        }

        setGenres(newGenres);

        // Filter genre options based on the user's input
        setAutocompleteResultsGenre((prev) => ({
            ...prev,
            [index]: genreOptions
            .filter((genre) => genre.genre.toLowerCase().startsWith(value.toLowerCase()))
                .slice(0, 5),
        }));
    };


    // Handle dropdown item selection for genres
    const handleGenreDropdownItemClick = (index: number, genre: string) => {
        const isDuplicate = genres.some((gen) => gen.genre === genre);
        if (isDuplicate) {
            setError("You have already selected this genre.");
            return;
        }

        // Find the genre from genre options
        const selectedGenre = genreOptions.find(gen => gen.genre.toLowerCase() === genre.toLowerCase());

        // If selection is not null, update the genre field with the selected option
        if(selectedGenre) {
            const newGenres = [...genres];
            newGenres[index] = {
                id: selectedGenre.id,
                genre: selectedGenre.genre
            };
            setGenres(newGenres);
        }

        // Clear error and hide dropdown after selection
        setError("");
        setAutocompleteResultsGenre((prev) => ({ ...prev, [index]: [] }));
    };

    // Add a new genre field
    const addGenreField = () => {
        // Prevent adding a duplicate genre
        const genreNames = genres.map((genre) => genre.genre.toLowerCase());
        if (genreNames.includes("")) {
            setError("Please fill out the current genre field before adding another.");
            return;
        }

        setGenres([...genres, { id: "", genre: "" }]);
        setError(""); // Clear error if successful
    };

    // Remove a genre field
    const removeGenreField = (index: number) => {
        if (genres.length > 1) {
            const newGenres = genres.filter((_, i) => i !== index);
            setGenres(newGenres);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Create a Job Listing</h1>
                <p className={styles.description}>
                    Post your upcoming event and hire talented musicians through our platform.
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Event Title */}
                <div className={styles.formGroup}>
                    <label htmlFor="eventTitle" className={styles.label}>Event Title</label>
                    <input
                        id="eventTitle"
                        type="text"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                {/* Venue */}
                <div className={styles.formGroup}>
                    <label htmlFor="venue" className={styles.label}>Venue</label>
                    <input
                        id="venue"
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                {/* Gig Type & Date/Time Options */}
                <div className={styles.formGroup}>
                    <label htmlFor="gigType" className={styles.label}>Gig Type</label>
                    <select
                        id="gigType"
                        value={gigType}
                        onChange={(e) => setGigType(e.target.value)}
                        className={styles.input}
                    >
                        <option value="oneTime">One-time Gig</option>
                        <option value="recurring">Recurring Gig</option>
                        <option value="longTerm">Long-term Gig</option>
                    </select>
                </div>

                {/* One-time Gig Fields */}
                {gigType === "oneTime" && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date</label>
                            <input
                                type="date"
                                value={oneTimeDate}
                                onChange={(e) => setOneTimeDate(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Start Time</label>
                            <input
                                type="time"
                                value={oneTimeStart}
                                onChange={(e) => setOneTimeStart(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>End Time</label>
                            <input
                                type="time"
                                value={oneTimeEnd}
                                onChange={(e) => setOneTimeEnd(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                    </>
                )}

                {/* Recurring Gig Fields */}
                {gigType === "recurring" && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Recurrence Pattern</label>
                            <select
                                value={recurringPattern}
                                onChange={(e) => setRecurringPattern(e.target.value)}
                                className={styles.input}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Start Date</label>
                            <input
                                type="date"
                                value={recurringDates || ""}
                                onChange={(e) => setRecurringDates(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Start Time - optional</label>
                            <input
                                type="time"
                                value={oneTimeStart}
                                onChange={(e) => setOneTimeStart(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Optional End Time - optional</label>
                            <input
                                type="time"
                                value={oneTimeEnd}
                                onChange={(e) => setOneTimeEnd(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </>
                )}

                {/* Long-term Gig Fields */}
                {gigType === "longTerm" && (
                    <>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Start Date</label>
                            <input
                                type="date"
                                value={longTermStart}
                                onChange={(e) => setLongTermStart(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>End Date - optional</label>
                            <input
                                type="date"
                                value={longTermEnd}
                                onChange={(e) => setLongTermEnd(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </>
                )}

                {/* Event Description */}
                <div className={styles.formGroup}>
                    <label htmlFor="eventDescription" className={styles.label}>Event Description</label>
                    <textarea
                        id="eventDescription"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        required
                        className={styles.textarea}
                    />
                </div>

                {/* Payment */}
                <div className={styles.formGroup}>
                    <label htmlFor="payment" className={styles.label}>Payment</label>
                    <select
                        id="payment"
                        value={payment}
                        onChange={(e) => setPayment(e.target.value)}
                        className={styles.input}
                    >
                        <option value="Fixed amount">Fixed amount</option>
                        <option value="Hourly rate">Hourly rate</option>
                    </select>
                </div>

                {payment === "Fixed amount" && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Fixed Amount ($)</label>
                        <input
                            type="number"
                            min="0"
                            step="10.00"
                            placeholder="Enter amount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>
                )}

                {payment === "Hourly rate" && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Hourly Rate ($)</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                                type="number"
                                min="0"
                                step="5.00"
                                placeholder="Enter rate"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className={styles.input}
                                required
                            />
                            <span>/hour</span>
                        </div>
                    </div>
                )}

                {/* Advance Selection Section */}
                <div className={styles.formGroup}>
                <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? "Hide" : "Show"} Advanced Application Settings
                </button>
                </div>

                {showAdvanced && (
                <div className={styles.advancedSection}>
                    {/* Experience Level */}
                    <label className={styles.label}>Desired Experience Level</label>
                    <select
                        className={styles.select}
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        >
                        <option value="">Select experience level</option>
                        <option value="Beginner">Beginner (0–1 year)</option>
                        <option value="Intermediate">Intermediate (1–3 years)</option>
                        <option value="Experienced">Experienced (3–5 years)</option>
                        <option value="Professional">Professional (5+ years)</option>
                        <option value="Studio Musician">Studio Musician</option>
                        <option value="Touring Musician">Touring Musician</option>
                        <option value="Music Degree">Formal Training (Music Degree)</option>
                    </select>

                    {/* Instruments */}
                    <h3 className={styles.label}>Preferred Instruments</h3>
                    {instruments.map((instrument, index) => (
                    <div key={index} className={styles.instrumentRow}>
                        <div className={styles.autocompleteWrapper}>
                        <input
                            type="text"
                            placeholder="Instrument"
                            className={styles.input}
                            value={instrument.instrument}
                            onChange={(e) => handleInstrumentChange(index, e.target.value)}
                        />
                        {autocompleteResultsInstruments[index]?.length > 0 && (
                            <div className={styles.autocompleteDropdown}>
                            {autocompleteResultsInstruments[index].map((option, i) => (
                                <div
                                key={i}
                                className={styles.autocompleteItem}
                                onClick={() => handleInstrumentDropdownItemClick(index, option.instrument)}
                                >
                                {option.instrument}
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                        <button
                            type="button"
                            className={styles.removeInstrumentButton}
                            onClick={() => removeInstrumentField(index)}
                            >
                            —
                        </button>
                    </div>
                    ))}
                    <button type="button" className={styles.addInstrumentButton} onClick={addInstrumentField}>
                    + Add another instrument
                    </button>

                    {/* Genres */}
                    <h3 className={styles.label}>Preferred Genres</h3>
                    {genres.map((genre, index) => (
                    <div key={index} className={styles.instrumentRow}>
                        <div className={styles.autocompleteWrapper}>
                        <input
                            type="text"
                            placeholder="Genre"
                            className={styles.input}
                            value={genre.genre}
                            onChange={(e) => handleGenreChange(index, e.target.value)}
                        />
                        {autocompleteResultsGenre[index]?.length > 0 && (
                            <div className={styles.autocompleteDropdown}>
                            {autocompleteResultsGenre[index].map((option, i) => (
                                <div
                                key={i}
                                className={styles.autocompleteItem}
                                onClick={() => handleGenreDropdownItemClick(index, option.genre)}
                                >
                                {option.genre}
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                        <button
                        type="button"
                        className={styles.removeInstrumentButton}
                        onClick={() => removeGenreField(index)}
                        >
                        —
                        </button>
                    </div>
                    ))}
                    <button type="button" className={styles.addInstrumentButton} onClick={addGenreField}>
                        + Add another genre
                    </button>
                </div>
                )}

                {/* Submit Button */}
                <button type="submit" className={styles.primaryButton}>Create Job Listing</button>
            </form>

            <div className={styles.footer}>
                <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.6 }}>
                    © 2025 MusicMatch Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
}