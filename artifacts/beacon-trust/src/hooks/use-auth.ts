import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "customer" | "staff" | "admin";
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
};

async function loadProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id,email,first_name,last_name,role,phone,avatar_url,is_active")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    isActive: data.is_active,
  };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Register listener FIRST, then read initial session (recommended order).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) {
        setUser(undefined);
        setIsLoading(false);
        return;
      }
      // Defer supabase call to avoid deadlock inside the callback
      setTimeout(async () => {
        const p = await loadProfile(s.user.id);
        if (mounted) {
          setUser(p ?? undefined);
          setIsLoading(false);
        }
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s) {
        const p = await loadProfile(s.user.id);
        if (mounted) setUser(p ?? undefined);
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    isError: false,
    error: undefined,
    isAuthenticated: !!session && !!user,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
