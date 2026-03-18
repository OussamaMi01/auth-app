// src/lib/auth/session-update.ts
import { auth } from "@/lib/auth/nextauth";

export async function updateSession(data: any) {
  const session = await auth();
  if (session) {
    // Update the session with new data
    // This will trigger the JWT callback with trigger: "update"
    return {
      ...session,
      user: {
        ...session.user,
        ...data,
      },
    };
  }
  return null;
}