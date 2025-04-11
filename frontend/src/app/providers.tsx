// src/app/providers.tsx
// File to separate provider components (needed for google login) from server components
"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/ProfileContext";    // Import profile context to ensure this is still included once Providers is used in layout.tsx

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
