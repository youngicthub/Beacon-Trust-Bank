import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, ArrowRight, Eye, EyeOff, MailCheck, Loader2 } from "@/lib/icons";

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


const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitting(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data: result, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          },
        },
      });
      if (error) throw error;

      // Session returned → email confirmation is disabled; user is signed in.
      if (result.session) {
        toast({ title: "Account created", description: "You're signed in and ready to go." });
        setLocation("/dashboard");
        return;
      }

      // No session yet — try signing in immediately. Succeeds when the
      // Supabase project has email confirmation disabled.
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInData.session) {
        toast({ title: "Account created", description: "You're signed in and ready to go." });
        setLocation("/dashboard");
        return;
      }

      // Email confirmation is enforced — ask the user to verify.
      // The confirmation link in the email will redirect back to this app.
      setPendingEmail(data.email);
      toast({
        title: "Verify your email",
        description: `We sent a confirmation link to ${data.email}.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: err?.message ?? "Unable to create account.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      toast({ title: "Email resent", description: `A new link is on its way to ${pendingEmail}.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Couldn't resend", description: err?.message ?? "Try again shortly." });
    } finally {
      setResending(false);
    }
  };


  if (pendingEmail) {
    return (
      <PublicLayout>
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 lg:py-24">
          <div className="w-full max-w-md bg-card border border-border/50 rounded-xl shadow-xl p-8 sm:p-10 text-center">
            <div className="bg-primary/10 p-3 rounded-xl mb-4 inline-flex">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Check your inbox</h1>
            <p className="text-sm text-muted-foreground mt-3">
              We sent a confirmation link to <span className="font-semibold text-foreground">{pendingEmail}</span>.
              Click the link to activate your account and sign in.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Didn't receive it? Check your spam folder or resend below.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={handleResend} disabled={resending} variant="outline" className="w-full">
                {resending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resending…</>) : "Resend confirmation email"}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => { setPendingEmail(null); form.reset(); }}
              >
                Use a different email
              </Button>
              <Link href="/login" className="text-sm text-primary hover:underline mt-2">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 lg:py-24">
        <div className="w-full max-w-md bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden">

          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="bg-primary/10 p-3 rounded-xl mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Create Your Account</h1>
              <p className="text-sm text-muted-foreground mt-2">Open a Beacon Trust account in minutes.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl><Input autoComplete="given-name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl><Input autoComplete="family-name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl><Input type="tel" autoComplete="tel" {...field} /></FormControl>
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
                            autoComplete="new-password"
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl><Input type={showPassword ? "text" : "password"} autoComplete="new-password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating account..." : (<>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
              </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
