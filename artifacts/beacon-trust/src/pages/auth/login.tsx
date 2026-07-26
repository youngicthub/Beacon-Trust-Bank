import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, ArrowRight, Eye, EyeOff } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PublicLayout } from "@/components/layout/public-layout";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or account number is required."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/** Detect whether the input looks like an account number (no @ symbol). */
function isAccountNumber(value: string) {
  return !value.includes("@");
}

/** Given an account number, look up the user's email.
 *  Returns null if not found or the KYC is not yet approved. */
async function resolveEmailFromAccountNumber(accountNumber: string): Promise<string> {
  const { data, error } = await supabase
    .from("accounts")
    .select("user_id, users(email, kyc_records(status))")
    .eq("account_number", accountNumber)
    .maybeSingle();

  if (error || !data) throw new Error("Account number not found.");

  const user = (data as any).users;
  const kycStatus = (user?.kyc_records as any[])?.[0]?.status;

  if (kycStatus !== "verified") {
    throw new Error("Your account has not been approved yet. Please contact support.");
  }

  const email = user?.email as string | undefined;
  if (!email) throw new Error("Could not resolve account. Please use your email address.");

  return email;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    try {
      let email = data.identifier.trim();

      if (isAccountNumber(email)) {
        email = await resolveEmailFromAccountNumber(email.toUpperCase());
      }

      const { data: auth, error } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });
      if (error || !auth.user) throw error ?? new Error("Sign-in failed");

      // Fetch role from profile
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", auth.user.id)
        .maybeSingle();

      toast({ title: "Welcome back", description: "Successfully authenticated." });

      const role = profile?.role;
      if (role === "admin") setLocation("/admin");
      else if (role === "staff") setLocation("/staff");
      else setLocation("/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: err?.message ?? "Invalid credentials.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 lg:py-24">
        <div className="w-full max-w-md bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="bg-primary/10 p-3 rounded-xl mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Secure Client Portal</h1>
              <p className="text-sm text-muted-foreground mt-2">Sign in to manage your wealth and accounts.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Account Number</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="you@example.com or BT-1234567"
                          autoComplete="username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Signing in..." : (<>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
              </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              New to Beacon Trust?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
