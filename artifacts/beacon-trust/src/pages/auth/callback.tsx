import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/layout/public-layout";

/**
 * Handles the redirect from Supabase auth emails
 * (email verification, magic link, password reset).
 * Waits for the session to hydrate, then routes by role.
 */
export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detect password recovery flow (comes in the URL hash)
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setLocation("/reset-password");
      return;
    }

    // Detect explicit error from Supabase in the hash
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const errDesc = params.get("error_description");
    if (errDesc) {
      setError(decodeURIComponent(errDesc));
      return;
    }

    const routeByRole = async (userId: string) => {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      const role = data?.role ?? "customer";
      if (role === "admin") setLocation("/admin");
      else if (role === "staff") setLocation("/staff");
      else setLocation("/dashboard");
    };

    // Wait for session (Supabase parses the hash automatically)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setTimeout(() => routeByRole(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        routeByRole(data.session.user.id);
      } else {
        // No session after a short wait → send back to login
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d2 }) => {
            if (!d2.session) setLocation("/login");
          });
        }, 1500);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [setLocation]);

  return (
    <PublicLayout>
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="max-w-md text-center space-y-4">
          {error ? (
            <>
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <h1 className="text-2xl font-serif font-bold">Verification failed</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => setLocation("/login")}
                className="text-sm text-primary hover:underline"
              >
                Return to sign in
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
              <h1 className="text-2xl font-serif font-bold">Confirming your account…</h1>
              <p className="text-sm text-muted-foreground">
                One moment while we sign you in.
              </p>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
