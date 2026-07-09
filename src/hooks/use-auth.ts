import { useEffect, useState } from "react";
import { getCurrentUser, getProfile, type AuthUser, type FarmerProfile } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setUser(getCurrentUser());
      setProfile(getProfile());
    };
    sync();
    setReady(true);
    window.addEventListener("poultryfit-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("poultryfit-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, profile, ready };
}
