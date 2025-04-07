// app/google-auth/page.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/ProfileContext";

export default function GoogleAuthRedirect() {
  const { data: session, status } = useSession();
  const { fetchProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const completeLogin = async () => {
      if (status === "authenticated" && session?.user?.email && session?.user?.id) {
        try {
          const response = await axios.post("http://localhost:8000/api/auth/google-login/", {
            email: session.user.email,
            google_id: session.user.id,
          });

          if (response.status === 200) {
            await fetchProfile();
            router.push(`/${response.data.username}`);
          } else {
            router.push("/login?error=backend");
          }
        } catch (err) {
          console.error("Backend login failed:", err);
          router.push("/login?error=backend");
        }
      }
    };

    completeLogin();
  }, [session, status]);

  return <p>Redirecting...</p>;
}
