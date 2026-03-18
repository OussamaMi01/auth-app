// src/lib/auth/validate-request.ts
import { getServerSession } from "@/lib/auth";

export async function validateRequest() {
  try {
    const session = await getServerSession();
    
    return {
      user: session?.user ? {
        id: session.user.id || "",
        email: session.user.email || "",
        name: session.user.name || "",
        avatar: "", // Add if you have avatars
      } : null,
      session: session ? {
        id: "nextauth-session",
        expires: session.expires,
      } : null,
    };
  } catch (error) {
    console.error("validateRequest error:", error);
    return {
      user: null,
      session: null,
    };
  }
}