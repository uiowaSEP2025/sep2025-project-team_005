"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useRouter } from "next/navigation";
import styles from "@/styles/UserSettings.module.css";
import Cookies from "js-cookie";

type UserData = {
  id: string;
  username: string;
  email: string;
  phone: string;
  instruments: { instrument_name: string; years_played: number }[];
  genre: string[];
  password: string;
  new_password: string;
  stage_name: string;
  years_played: number;
  home_studio: boolean;
};

const EditableInput = ({
  label,
  field,
  value,
  onChange,
  isEditing,
}: {
  label: string;
  field: keyof UserData;
  value: string;
  onChange: (field: keyof UserData, value: string) => void;
  isEditing: boolean;
}) => (
  <div className={styles.field}>
    <label className={styles.featureTitle} htmlFor={field}>{label}</label>
    <input
      id={field}
      type="text"
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={styles.inputField}
      disabled={!isEditing}
      data-testid={`${field}-input`}
    />
  </div>
);

const EditableList = ({
  label,
  field,
  values,
  showInput,
  inputValue,
  setInputValue,
  onAdd,
  onRemove,
  setShowInput,
  isEditing,
  instrumentInput,
  setInstrumentInput,
  yearsPlayedInput,
  setYearsPlayedInput,
}: {
  label: string;
  field: "instruments" | "genre";
  values: { instrument_name: string; years_played: number }[] | string[];
  showInput: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onAdd: (field: "instruments" | "genre", value: string | { instrument_name: string; years_played: number }) => void;
  onRemove: (field: "instruments" | "genre", index: number) => void;
  setShowInput: (show: boolean) => void;
  isEditing: boolean;
  instrumentInput: string;
  setInstrumentInput: (value: string) => void;
  yearsPlayedInput: string;
  setYearsPlayedInput: (value: string) => void;
}) => (
  <div className={styles.field}>
    <label className={styles.featureTitle}>{label}</label>
    <ul>
      {values.map((item, index) => (
        <li key={index} className={styles.listItem}>
          {field === "instruments" && typeof item !== "string" ? (
            <span>
              {item.instrument_name} - {item.years_played} years
              {isEditing && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => onRemove(field, index)}
                  data-testid={`remove-button-${index}`}
                >
                  -
                </button>
              )}
            </span>
          ) : field === "genre" ? (
            <span>
              {String(item)}
              {isEditing && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => onRemove(field, index)}
                  data-testid={`remove-button-${index}`}
                >
                  -
                </button>
              )}
            </span>
          ) : null}
        </li>
      ))}
    </ul>

    {isEditing && (
      <>
        {!showInput && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setShowInput(true)}
            data-testid={`${field}-add-button`}
          >
            +
          </button>
        )}

        {showInput && field === "instruments" && (
          <div className={styles.instrumentInputContainer}>
            <input
              type="text"
              value={instrumentInput} // Separate state for instrument name
              onChange={(e) => setInstrumentInput(e.target.value)}
              className={styles.inputField}
              placeholder="Add instruments"
            />
            <input
              type="number"
              value={yearsPlayedInput} // Separate state for years played
              onChange={(e) => setYearsPlayedInput(e.target.value)}
              className={styles.inputField}
              placeholder="Years played"
            />
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                if (!instrumentInput || !yearsPlayedInput) return;
                onAdd(field, { instrument_name: instrumentInput, years_played: Number(yearsPlayedInput) });
                setInstrumentInput(""); // Clear input after adding
                setYearsPlayedInput("");
                setShowInput(false);
              }}
              data-testid="instruments-confirm-add"
            >
              Add
            </button>
          </div>
        )}


        {showInput && field === "genre" && (
          <div className={styles.instrumentInputContainer}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.inputField}
              placeholder="Add Genre"
            />
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                if (!inputValue) return;
                onAdd(field, inputValue);
                setInputValue("");
                setShowInput(false);
              }}
              data-testid={`genre-confirm-add`}
            >
              Add
            </button>
          </div>
        )}
      </>
    )}
  </div>
);

type PasswordFieldProps = {
  field: "password" | "new_password";
  value: string;
  onChange: (field: keyof UserData, value: string) => void;
  isEditing: boolean;
};

const PasswordField = ({ field, value, onChange, isEditing }: PasswordFieldProps) => {
const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.field}>
      <label className={styles.featureTitle} htmlFor={field}>
        {field === "password" ? "Current Password" : "New Password"}
      </label>
      <div className={styles.passwordContainer}>
        <input
          id={field}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className={styles.inputField}
          disabled={!isEditing}
        />
        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff size={30} /> : <Eye size={30} />}
        </button>
      </div>
    </div>
  );
};

export default function UserSettings() {
  useRequireAuth();
  
  const router = useRouter();
  const { profile, isLoading } = useAuth();
  const [editExperience, setEditExperience] = useState(false);
  const [editSecurity, setEditSecurity] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showInputField, setShowInputField] = useState<"instruments" | "genre" | null>(null);
  const [instrumentInput, setInstrumentInput] = useState("");
  const [yearsPlayedInput, setYearsPlayedInput] = useState("");
  const [genreInput, setGenreInput] = useState("");

  const [userData, setUserData] = useState<UserData>({
    id: "",
    username: "",
    email: "",
    phone: "",
    instruments: [],
    genre: [],
    password: "",
    new_password: "",
    stage_name: "",
    years_played: 0,
    home_studio: false,
  });

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, ""); // Remove all non-numeric characters
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)})${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };
  
  useEffect(() => {
    const fetchMusicianData = async () => {
      if (profile && !isLoading) {
        setUserData({
          id: profile.id ? String(profile.id) : "",
          username: profile.username || "",
          email: profile.email || "",
          phone: profile.phone || "",
          instruments: [],
          genre: [],
          password: "",
          new_password: "",
          stage_name: "",
          years_played: 0,
          home_studio: false,
        });
  
        try {
          const response = await fetch(`http://localhost:8000/api/musician/${profile.id}/`, {
            method: "GET",
            credentials: "include",
          });
  
          if (response.ok) {
            const data = await response.json();
            setUserData((prev) => ({
              ...prev,
              instruments: data.instruments,
              genre: data.genres,
              stage_name: data.stage_name,
              years_played: data.years_played,
              home_studio: data.home_studio,
            }));
          } 
          else {
            console.error("Failed to fetch musician data", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching musician data:", error);
        }
      }
    };
  
    fetchMusicianData();
  }, [profile, isLoading]); 
  
  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/musician/${userData.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          phone: userData.phone,
          instruments: userData.instruments,
          genre: userData.genre,
          stage_name: userData.stage_name,
          years_played: userData.years_played,
          home_studio: userData.home_studio,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Updated data:", data);
      } else {
        console.error("Failed to update user data", response.statusText);
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleChangePassword = async () => {
    if (!userData.password || !userData.new_password) {
      alert("Please enter both the current and new passwords.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          password: userData.password,
          new_password: userData.new_password,
        }),
      });

      if (response.ok) {
        alert("Password changed successfully");
        setUserData((prev) => ({ ...prev, password: "", new_password: "" }));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleChange = (field: keyof UserData, value: string) => {
    let newValue = value;
  
    if (field === "phone") {
      newValue = formatPhoneNumber(value);
    }
  
    setUserData((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleAddToList = (field: "instruments" | "genre", value: string | { instrument_name: string; years_played: number }) => {
    if (field === "instruments" && typeof value !== "string") {
      setUserData((prev) => ({
        ...prev,
        instruments: [...prev.instruments, value], // Directly add the object
      }));
    } else if (typeof value === "string") {
      setUserData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    }
  
    if (field === "instruments") setInstrumentInput("");
    if (field === "genre") setGenreInput("");
  };  

  const handleRemoveFromList = (field: "instruments" | "genre", index: number) => {
    setUserData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const toggleEdit = () => {
    setIsEditing((prev) => {
      if (prev) {
        handleSave();
      }
      return !prev;
    });
  };

  const toggleEditExperience = () => {
    setEditExperience((prev) => {
        if (prev) {
            handleSave();
        }
        return !prev;
    });
  };

  const toggleEditSecurity = () => {
    setEditSecurity((prev) => {
      if (prev) {
        handleChangePassword();
      }
      return !prev;
    });
  };

  if (!profile) {
    return;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Settings</h1>
        <p className={styles.description}>Update your profile information below.</p>
      </div>
      
      {/* Personal Information Form */}
      <form className={styles.features}>
        <div className={styles.featureCard}>
          <h2 className={styles.cardTitle}>Personal Information</h2>
          {["username", "email", "phone"].map((field) => (
            <EditableInput
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              field={field as keyof UserData}
              value={userData[field as keyof UserData] as string}
              onChange={handleChange}
              isEditing={isEditing}
            />
          ))}
          <button type="button" className={styles.secondaryButton} onClick={toggleEdit}>
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </form>
      
      {/* Experience Information Form */}
      <form className={styles.features}>
        <div className={styles.featureCard}>
            <h2 className={styles.cardTitle}>Experience Information</h2>
            
            <EditableList
              label="Instruments"
              field="instruments"
              values={userData.instruments}
              showInput={showInputField === "instruments"}
              inputValue={instrumentInput}
              setInputValue={setInstrumentInput}
              onAdd={handleAddToList}
              onRemove={handleRemoveFromList}
              setShowInput={(show) => setShowInputField(show ? "instruments" : null)}
              isEditing={editExperience}
              instrumentInput= {instrumentInput}
              setInstrumentInput= {setInstrumentInput}
              yearsPlayedInput= {yearsPlayedInput}
              setYearsPlayedInput= {setYearsPlayedInput}
            />

            <EditableList
              label="Genre"
              field="genre"
              values={userData.genre}
              showInput={showInputField === "genre"}
              inputValue={genreInput}
              setInputValue={setGenreInput}
              onAdd={handleAddToList}
              onRemove={handleRemoveFromList}
              setShowInput={(show) => setShowInputField(show ? "genre" : null)}
              isEditing={editExperience}
              instrumentInput= {instrumentInput}
              setInstrumentInput= {setInstrumentInput}
              yearsPlayedInput= {yearsPlayedInput}
              setYearsPlayedInput= {setYearsPlayedInput}
            />
            
            <button
                type="button"
                className={styles.secondaryButton}
                onClick={toggleEditExperience}
            >
                {editExperience ? "Done" : "Edit"}
            </button>
        </div>
      </form>

      
      {/* Security Information Form */}
      <form className={styles.features}>
        <div className={styles.featureCard}>
          <h2 className={styles.cardTitle}>Security Information</h2>

          {/* Password Field */}
          <PasswordField
            field="password"
            value={userData.password}
            onChange={handleChange}
            isEditing={editSecurity}
          />

          {/* New Password Field */}
          <PasswordField
            field="new_password"
            value={userData.new_password}
            onChange={handleChange}
            isEditing={editSecurity}
          />

          {/* Edit/Done Button */}
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={toggleEditSecurity}
          >
            {editSecurity ? "Done" : "Edit"}
          </button>
        </div>
      </form>
    </div>
  );
}