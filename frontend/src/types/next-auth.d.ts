// types/next-auth.d.ts

// This file is a custom TS global declaration for extending/customizing next-auth User and Session

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      id: string; // 👈 this is your custom field
    };
  }

  interface User {
    id: string;
  }
}
