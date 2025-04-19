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
  password: string;
  new_password: string;
  business: string;
  industry: string;
};

const EditableInput = ({
    label,
    field,
    value,
    onChange,
    isEditing,
} : {
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
          aria-label="Show Password"
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
  const [editCompany, setEditCompany] = useState(false);
  const [editSecurity, setEditSecurity] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [userData, setUserData] = useState<UserData>({
    id: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    new_password: "",
    business: "",
    industry: "",
  });

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, ""); // Remove all non-numeric characters
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)})${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };
  
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (profile && !isLoading) {
        setUserData({
          id: profile.id ? String(profile.id) : "",
          username: profile.username || "",
          email: profile.email || "",
          phone: profile.phone || "",
          password: "",
          new_password: "",
          business: "",
          industry: "",
        });
  
        try {
          const response = await fetch(`http://localhost:8000/api/business/${profile.id}/`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${Cookies.get("access_token")}`,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            setUserData((prev) => ({
              ...prev,
              business: data.business_name,
              industry: data.industry,
            }));
          } 
          else {
            console.error("Failed to fetch business data", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching business data:", error);
        }
      }
    };
  
    fetchBusinessData();
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
          business_name: userData.business,
          industry: userData.industry,
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

  const toggleEdit = () => {
    setIsEditing((prev) => {
      if (prev) {
        handleSave();
      }
      return !prev;
    });
  };

  const toggleEditCompany = () => {
    setEditCompany((prev) => {
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
      
      {/* Company Information Form */}
      <form className={styles.features}>
        <div className={styles.featureCard}>
          <h2 className={styles.cardTitle}>Personal Information</h2>
          {["business", "industry"].map((field) => (
            <EditableInput
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              field={field as keyof UserData}
              value={userData[field as keyof UserData] as string}
              onChange={handleChange}
              isEditing={editCompany}
            />
          ))}
          <button type="button" className={styles.secondaryButton} onClick={toggleEditCompany}>
            {editCompany ? "Done" : "Edit"}
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