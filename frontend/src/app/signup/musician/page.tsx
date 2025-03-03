// Sign up page for musician accounts

"use client"; 

import styles from "@/styles/Signup.module.css";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Temporary list of instruments until I can seed database
const instrumentOptions = [
    "Piano", "Guitar", "Violin", "Drums", "Flute", "Saxophone", "Trumpet", "Bass Guitar", "Cello", "Clarinet"
];

export default function MusicianSignup() {
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [instruments, setInstruments] = useState([{ name: "", years: "" }]);
    const [autocompleteResults, setAutocompleteResults] = useState<{ [key: number]: string[] }>({});

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

    // Handle instrument input change
    const handleInstrumentChange = (index: number, value: string, isSelection = false) => {
        const instrumentNames = instruments.map((inst) => inst.name.toLowerCase());
        
        // Prevent duplicate selection
        if (instrumentNames.includes(value.toLowerCase()) && instruments[index].name !== value) {
            setError("You have already selected this instrument.");
            return;
        }

        setError(""); // Clear error if valid
        const newInstruments = [...instruments];
        newInstruments[index].name = value;
        setInstruments(newInstruments);

        // Filter instrument options based on the user's input
        setAutocompleteResults((prev) => ({
            ...prev,
            [index]: instrumentOptions
                .filter((inst) => inst.toLowerCase().startsWith(value.toLowerCase()))
                .slice(0, 5),
        }));
    }; 

    // Handle dropdown item selection
    const handleDropdownItemClick = (index: number, instrument: string) => {
        console.log("Clicked item")
        const isDuplicate = instruments.some((inst) => inst.name === instrument);
        if (isDuplicate) {
            setError("You have already selected this instrument.");
            return;
        }
    
        // Update the instrument field with the selected option
        const newInstruments = [...instruments];
        newInstruments[index].name = instrument;
        setInstruments(newInstruments);
    
        // Clear error and hide dropdown after selection
        setError("");
        setAutocompleteResults((prev) => ({ ...prev, [index]: [] }));
        console.log(instrument)
    };

    const handleYearsChange = (index: number, value: string) => {
        const newInstruments = [...instruments];
        newInstruments[index].years = value;
        setInstruments(newInstruments);
    };

    // Add a new instrument field
    const addInstrumentField = () => {
        // Prevent adding a duplicate instrument
        const instrumentNames = instruments.map((inst) => inst.name.toLowerCase());
        if (instrumentNames.includes("")) {
            setError("Please fill out the current instrument field before adding another.");
            return;
        }
    
        setInstruments([...instruments, { name: "", years: "" }]);
        setError(""); // Clear error if successful
    };

    const removeInstrumentField = (index: number) => {
        if (instruments.length > 1) {
            const newInstruments = instruments.filter((_, i) => i !== index);
            setInstruments(newInstruments);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form from submitting by default

        // Check that all fields are filled out
        if (!email || !username) {
            setError("All fields are required.");
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

        setError(""); // Clear error if validation passes
        console.log("Form submitted successfully:", email, username, password);


        // *** FINISH LATER:
        // Proceed with form submission (e.g., API call)
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Image src="/savvy.png" alt="Platform Logo" width={200} height={200} />
                <h1 className={styles.title}>Sign Up: Musician</h1>
            </header>
            
            <form className={styles.form} onSubmit={handleSubmit}>
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

                <h3 className={styles.label}>Instruments Played:</h3>

                {instruments.map((instrument, index) => (
                    <div key={index} className={styles.instrumentRow}>
                        <div className={styles.autocompleteWrapper}>
                            <input
                                type="text"
                                placeholder="Instrument"
                                className={styles.inputField}
                                value={instrument.name}
                                onChange={(e) => handleInstrumentChange(index, e.target.value)}
                            />
                            {autocompleteResults[index] && autocompleteResults[index].length > 0 && (
                                <div className={styles.autocompleteDropdown}>
                                    {autocompleteResults[index].map((inst, i) => (
                                        <div
                                            key={i}
                                            className={styles.autocompleteItem}
                                            onClick={() => handleDropdownItemClick(index, inst)}
                                        >
                                        {inst}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <input
                            type="number"
                            placeholder="Years played"
                            value={instrument.years}
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


                {error && <p className={styles.error}>{error}</p>} {/* Show error if invalid */}
                <button type="submit" className={styles.submitButton}>Sign Up</button>
            </form>

        </div>
    );
}