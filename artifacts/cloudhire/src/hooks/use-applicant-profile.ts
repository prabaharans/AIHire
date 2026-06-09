import { useState, useCallback } from "react";

export interface ApplicantProfile {
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
}

const STORAGE_KEY = "aihire_applicant_profile";

function readProfile(): ApplicantProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.email) return null;
    return parsed as ApplicantProfile;
  } catch {
    return null;
  }
}

export function useApplicantProfile() {
  const [profile, setProfile] = useState<ApplicantProfile | null>(readProfile);

  const saveProfile = useCallback((data: ApplicantProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setProfile(data);
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
  }, []);

  return {
    profile,
    hasProfile: profile !== null,
    saveProfile,
    clearProfile,
  };
}
