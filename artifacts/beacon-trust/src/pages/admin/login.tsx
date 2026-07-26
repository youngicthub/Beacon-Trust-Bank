import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, ArrowRight, Eye, EyeOff } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PublicLayout } from "@/components/layout/public-layout";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type Values = z.infer<typeof schema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: Values) => {
    setSubmitting(true);
    try {
      const { data: auth, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error || !auth.user) throw error ?? new Error("Sign-in failed");

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", auth.user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }

      toast({ title: "Welcome, Administrator", description: "Signed in successfully." });
      setLocation("/admin");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Admin Sign-in Failed",
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
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Admin Portal</h1>
              <p className="text-sm text-muted-foreground mt-2">Restricted access. Administrators only.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" placeholder="admin@example.com" {...field} />
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
                          <Input type={showPassword ? "text" : "password"} autoComplete="current-password" {...field} />
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
              Need an admin account?{" "}
              <Link href="/admin/register" className="text-primary hover:underline font-medium">
                Register with access code
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
