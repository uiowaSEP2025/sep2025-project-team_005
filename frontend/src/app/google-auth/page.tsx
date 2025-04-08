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
            credentials: "include",
          }, 
          {
            withCredentials: true,
          }
        );
          if (response.status === 200) {
            await fetchProfile();
            router.push(`/${response.data.user.username}`);
          } 
          else if (response.status === 202) {
            // Status of 202 from backend indicates that google auth succeeded, but user with this email does not yet exist
            // Redirect to sign up role-selection page, passing the user as a query parameter
            router.push(`/signup?email=${encodeURIComponent(session.user.email)}`);
          }
          else {
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
