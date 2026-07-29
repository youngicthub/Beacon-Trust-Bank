import { useEffect } from "react";
import { useLocation } from "wouter";
import { getToken } from "@/hooks/use-auth";

/**
 * Supabase OAuth callback — no longer used.
 * Simply redirects to dashboard if authenticated, else to login.
 */
export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const token = getToken();
    if (token) {
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  }, [setLocation]);

  return null;
}
