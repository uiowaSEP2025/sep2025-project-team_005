'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/context/ProfileContext";
import axios from 'axios';
import Cookies from "js-cookie";


interface Experience {
  job_title: string;
  company_name: string;
  start_date: string;
  end_date: string;
  description: string;
}

const defaultExperience: Experience = {
  job_title: '',
  company_name: '',
  start_date: '',
  end_date: '',
  description: '',
};

export default function ExperienceUpload() {
    useRequireAuth();

    const { id } = useParams();
    const { app_id } = useParams();
    const router = useRouter();
    const { profile, isLoading, setProfile } = useAuth();
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [manualMode, setManualMode] = useState(false);

    useEffect(() => {
        const fetchApplicationAndParseResume = async () => {
            if (!app_id) return;
            setLoading(true);

            try {
                // Get the JobApplication
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/job-application/${app_id}/`, {
                    withCredentials: true,
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("access_token")}`
                    }
                });
                const { file_keys } = response.data;

                if (file_keys && file_keys.length > 0) {
                    const fileKey = file_keys[0];

                    // Send to resume parser using S3 key
                    const parseResponse = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API}/api/parse-resume/`, {
                        s3_key: fileKey,
                    });

                    const data = parseResponse.data;
                    if (data.experience && data.experience.length > 0) {
                        setExperiences(data.experience);
                    } else {
                        setManualMode(true);
                    }
                } else {
                    setManualMode(true);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to retrieve resume. Try manual entry.");
                setManualMode(true);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicationAndParseResume();
    }, [app_id]);

    const updateExperience = (index: number, field: keyof Experience, value: string) => {
        const updated = [...experiences];
        updated[index][field] = value;
        setExperiences(updated);
    };

    const addExperience = () => setExperiences([...experiences, { ...defaultExperience }]);

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white shadow rounded-xl">
            <h2 className="text-xl font-bold mb-4">Resume Experience</h2>

            {loading && <p>Loading resume data...</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}

            {(manualMode || experiences.length > 0) && (
                <div className="mt-6 space-y-6">
                    <h3 className="text-lg font-semibold">Experience</h3>
                    {experiences.map((exp, idx) => (
                        <div key={idx} className="border p-4 rounded bg-gray-50 space-y-2">
                            <input
                                type="text"
                                placeholder="Job Title"
                                value={exp.job_title}
                                onChange={(e) => updateExperience(idx, 'job_title', e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                placeholder="Company Name"
                                value={exp.company_name}
                                onChange={(e) => updateExperience(idx, 'company_name', e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Start Date"
                                    value={exp.start_date}
                                    onChange={(e) => updateExperience(idx, 'start_date', e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="End Date"
                                    value={exp.end_date}
                                    onChange={(e) => updateExperience(idx, 'end_date', e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <textarea
                                placeholder="Description"
                                value={exp.description}
                                onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    ))}
                    <button
                        onClick={addExperience}
                        className="text-blue-600 underline text-sm"
                    >
                        + Add another experience
                    </button>
                </div>
            )}
        </div>
    );
}