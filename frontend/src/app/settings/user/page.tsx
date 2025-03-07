"use client";

import { useState, useEffect } from "react";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import { useRouter } from "next/navigation";
import styles from "@/styles/UserSettings.module.css";
import axios from "axios";

type UserData = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  instruments: string[];
  genre: string[];
  password: string;
  confirm_password: string;
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
    <label className={styles.featureTitle}>{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className={styles.inputField}
      disabled={!isEditing}
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
} : {
  label: string;
  field: "instruments" | "genre";
  values: string[];
  showInput: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onAdd: (field: "instruments" | "genre", value: string) => void;
  onRemove: (field: "instruments" | "genre", index: number) => void;
  setShowInput: (show: boolean) => void;
  isEditing: boolean;
}) => (
  <div className={styles.field}>
    <label className={styles.featureTitle}>{label}</label>
    <ul>
      {values.map((item, index) => (
        <li key={index} className={styles.listItem}>
          {item}
          {isEditing && (
            <button type="button" className={styles.removeButton} onClick={() => onRemove(field, index)}>
              -
            </button>
          )}
        </li>
      ))}
    </ul>
    {isEditing && (
      <>
        <button type="button" className={styles.primaryButton} onClick={() => setShowInput(true)}>
          +
        </button>
        {showInput && (
          <>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.inputField}
              placeholder={`Add ${label.toLowerCase()}`}
            />
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                onAdd(field, inputValue);
                setShowInput(false);
              }}
            >
              Add
            </button>
          </>
        )}
      </>
    )}
  </div>
);

type PasswordFieldProps = {
  field: "password" | "confirm_password";
  value: string;
  onChange: (field: keyof UserData, value: string) => void;
  isEditing: boolean;
};

const PasswordField = ({ field, value, onChange, isEditing }: PasswordFieldProps) => {
  return (
    <div className={styles.field}>
      <label className={styles.featureTitle}>
        {field === "password" ? "Password" : "Confirm Password"}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        className={styles.inputField}
        disabled={!isEditing} // Only enable input if editing
      />
    </div>
  );
};

export default function UserSettings() {
  useRequireAuth();
  
  const router = useRouter();
  const { profile, isLoading } = useAuth();

  const [userData, setUserData] = useState<UserData>({
    id: "",
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    instruments: ["Piano", "Guitar"],
    genre: ["Punk", "Indie"],
    password: "",
    confirm_password: "",
  });
  const [musicianData, setMusicianData] = useState<{ instruments: string[]; genre: string[] } | null>(null);
  
  useEffect(() => {
    if (profile && !isLoading) {
      setUserData({
        id: profile.id ? String(profile.id) : "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
        instruments: [],
        genre: [],
        password: "",
        confirm_password: "",
      });
      const fetchMusicianData = async () => {
        try {
          const response = await axios.get(`/musician/${profile.id}`);
          setMusicianData(response.data); // Store musician data in state
        } catch (error) {
          console.error("Error fetching musician data", error);
        }
      };

      fetchMusicianData();
    }
  }, [profile, isLoading]);

  const [editField, setEditField] = useState<keyof UserData | null>(null);
  const [editExperience, setEditExperience] = useState(false);
  const [showInputField, setShowInputField] = useState<"instruments" | "genre" | null>(null);
  const [instrumentInput, setInstrumentInput] = useState("");
  const [genreInput, setGenreInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditExperience = () => {
    setEditExperience((prev) => !prev);
    setShowInputField(null);
  };

  const handleRemoveFromList = (field: "instruments" | "genre", index: number) => {
    setUserData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (field: keyof UserData) => {
    setEditField(field);
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleChange = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddToList = (field: "instruments" | "genre", value: string) => {
    if (value.trim() !== "") {
      setUserData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
    }
    if (field === "instruments") setInstrumentInput("");
    if (field === "genre") setGenreInput("");
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
          {["first_name", "last_name", "username", "email", "phone"].map((field) => (
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
            isEditing={isEditing}
          />
          
          {/* Confirm Password Field */}
          <PasswordField
            field="confirm_password"
            value={userData.confirm_password}
            onChange={handleChange}
            isEditing={isEditing}
          />

          {/* Done Button */}
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={toggleEdit} // Toggle edit mode
            disabled={userData.password !== userData.confirm_password}
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        </div>
      </form>
    </div>
  );
}
