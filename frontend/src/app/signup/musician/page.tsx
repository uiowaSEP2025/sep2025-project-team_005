"use client"; 

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


// Ensures that the genres read from the database are explicitly types
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

  interface SignupData {
    username: string;
    password: string;
    email: string;
    role: string;
    stage_name: string;
    home_studio: boolean;
    instruments: Instrument[];
    genres: Genre[];
  }

export default function MusicianSignup() {
    const [error, setError] = useState("");
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [stageName, setStageName] = useState("");
    const [homeStudio, setHomeStudio] = useState("");
    const [instruments, setInstruments] = useState<Instrument[]>([{ id: "", instrument: "", years_played: "" }]);
    const [genres, setGenres] = useState<Genre[]>([{ id: "", genre: "" }]);
    const [autocompleteResultsInstruments, setAutocompleteResultsInstruments] = useState<{
        [key: number]: InstrumentOption[];
    }>({});
    const [autocompleteResultsGenre, setAutocompleteResultsGenre] = useState<{
        [key: number]: GenreOption[];
    }>({});
    const [instrumentOptions, setInstrumentOptions] = useState<InstrumentOption[]>([]);
    const [genreOptions, setGenreOptions] = useState<GenreOption[]>([]);

    // Fetch instruments and genres from the database when the component mounts
    useEffect(() => {
        // Fetch instrument options
        const fetchInstruments = async () => {
            try {
                const response = await fetch('https://savvy-note.com/api/instruments/all/', {
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
                const response = await fetch('https://savvy-note.com/api/genres/all/', {
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
    }, []); // Empty dependency array ensures this runs once when the component mounts

    // On top of pre-existing HTML5 email validations, use regex to validate email on submission
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Function to validate password strength
    const validatePassword = (password: string): boolean => {
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?/~`])[A-Za-z\d!@#$%^&*()_+{}[\]:;<>,.?/~`]{8,}$/;

        if (!strongPasswordRegex.test(password)) {
            setPasswordError("Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.");
            return false;
        } 

        setPasswordError(""); // Clear the error if valid
        return true;
    };

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHomeStudio(event.target.value);
    };

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
            newInstruments[index] = { id: selectedInstrument.id, instrument: value, years_played: instruments[index].years_played };
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
                years_played: newInstruments[index]?.years_played || ""  // Keep existing years or set to empty string if undefined
            };
            setInstruments(newInstruments);
        }

        // Clear error and hide dropdown after selection
        setError("");
        setAutocompleteResultsInstruments((prev) => ({ ...prev, [index]: [] }));
    };

    const handleYearsChange = (index: number, value: string) => {
        const newInstruments = [...instruments];
        newInstruments[index].years_played = value;
        setInstruments(newInstruments);
    };

    // Add a new instrument field
    const addInstrumentField = () => {
        // Prevent adding a duplicate instrument
        const instrumentNames = instruments.map((inst) => inst.instrument.toLowerCase());
        if (instrumentNames.includes("")) {
            setError("Please fill out the current instrument field before adding another.");
            return;
        }

        setInstruments([...instruments, { id: "", instrument: "", years_played: "" }]);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();     // Prevent page reload

        // Check that all fields are filled out
        if (!email || !username || !password) {
            setError("Email, username, and password are required.");
            return;
        }

        // Double-check that email address is valid
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // Validate password
        if (!validatePassword(password)) {
            setError("Please fix the errors before submitting.");
            return;
        }

        // Validate instruments against the predefined list
        for (const instrument of instruments) {
            // Check if the instrument exists in instrumentOptions
            const instrumentExists = instrumentOptions.some((option) => option.instrument.toLowerCase() === instrument.instrument.toLowerCase());

            if (!instrumentExists && !(instrument.instrument.trim() === "")) {
                setError(`"${instrument.instrument}" is not a valid instrument`)
                return;
            }
        }

        // Validate genres against the predefined list
        for (const genre of genres) {
            // Check if the genre's name exists in the genreOptions
            const genreExists = genreOptions.some((option) => option.genre.toLowerCase() === genre.genre.toLowerCase());

            if (!genreExists && !(genre.genre.trim() === "")) {
                setError(`"${genre.genre}" is not a valid genre.`);
                return;
            }
        }

        setError(""); // Clear error if validation passes

        const role = "musician"
        const userData: SignupData = {
            username: username,
            password: password,
            email: email,
            role: role,
            stage_name: stageName,
            home_studio: homeStudio === "Yes" ? true : homeStudio === "No" ? false : true,
            instruments: instruments.map(inst => ({
              id: inst.id,
              instrument: inst.instrument,
              years_played: inst.years_played
            })),
            genres: genres.map(genre => ({
              id: genre.id,
              genre: genre.genre
            }))
        };

        try {
            const response = await fetch("https://savvy-note.com/api/auth/signup/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Signup successful! Redirecting to login...");
                router.push("/login"); // Redirect to login page if successful
            } else {
                const errorData = await response.json(); // Read JSON error response
                setError(errorData.email || errorData.username || "Signup failed. Please try again.");

                console.log(errorData)
            }
        } catch (error) {
            console.error("Signup error:", error);
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
                <h1 className={styles.title}>Sign Up: Musician</h1>
            </header>

            <form role="form" className={styles.form} onSubmit={handleSubmit}>
                <label htmlFor="email" className={styles.label}>Email:</label>
                <input
                    type="email"    // HTML5 pre-enforced validation for email
                    id="email"
                    name="email"
                    required        // Require field to be filled out upon submission
                    placeholder="Enter your email"
                    className={styles.inputField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="username" className={styles.label}>Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    placeholder="Choose a username"
                    className={styles.inputField}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="password" className={styles.label}>Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    placeholder="Create a strong password"
                    className={styles.inputField}
                    value={password}
                    onChange={(e) => {
                        const newPassword = e.target.value;
                        setPassword(newPassword);
                        validatePassword(newPassword);
                    }}
                />
                {passwordError && <p className={styles.error}>{passwordError}</p>}

                <label htmlFor="stageName" className={styles.label}>Stage Name:</label>
                <input
                    type="text"
                    id="stageName"
                    name="stageName"
                    placeholder="Stage Name"
                    className={styles.inputField}
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                />

                <div>
                    <label className={styles.label}>Do you have a home studio?</label>
                    <div className={styles.radioButtons}>
                        <label>
                            <input
                                type="radio" 
                                id="yes" 
                                name="decision" 
                                value="Yes" 
                                onChange={handleRadioChange} 
                                checked={homeStudio === 'Yes'} 
                                className={styles.radioButton} 
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio" 
                                id="no" 
                                name="decision" 
                                value="No" 
                                onChange={handleRadioChange} 
                                checked={homeStudio === 'No'} 
                                className={styles.radioButton} 
                            />
                            No
                        </label>
                    </div>
                </div>

                <h3 className={styles.label}>Instruments Played:</h3>

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
                                            onClick={() => handleInstrumentDropdownItemClick(index, option.instrument)}
                                        >
                                        {option.instrument}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <input
                            type="number"
                            placeholder="Years played"
                            value={instrument.years_played}
                            onChange={(e) => handleYearsChange(index, e.target.value)}
                            className={styles.inputField}
                        />

                        <button 
                            type="button" 
                            className={styles.removeInstrumentButton} 
                            onClick={() => removeInstrumentField(index)}
                        >
                            ➖
                        </button>

                    </div>
                ))}

                <button type="button" className={styles.addInstrumentButton} onClick={addInstrumentField}>
                    + Add another instrument
                </button>

                <h4 className={styles.label}>Genres Played:</h4>

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
                            ➖
                        </button>

                    </div>
                ))}

                <button type="button" className={styles.addInstrumentButton} onClick={addGenreField}>
                    + Add another genre
                </button>


                {error && <p className={styles.error}>{error}</p>} {/* Show error if invalid */}
                <button type="submit" className={styles.submitButton}>Sign Up</button>
            </form>

        </div>
    );
}