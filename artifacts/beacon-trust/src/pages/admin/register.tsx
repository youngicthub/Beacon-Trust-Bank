import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldPlus, ArrowRight, Eye, EyeOff } from "@/lib/icons";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PublicLayout } from "@/components/layout/public-layout";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  adminToken: z.string().min(1, "Access code is required."),
});
type Values = z.infer<typeof schema>;

export default function AdminRegister() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", password: "", adminToken: "" },
  });

  const onSubmit = async (data: Values) => {
    setSubmitting(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("admin-register", {
        body: data,
      });
      if (error) throw error;
      if ((res as any)?.error) throw new Error((res as any).error);

      // Auto sign-in after registration.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInErr) throw signInErr;

      toast({ title: "Admin account created", description: "Welcome to the admin portal." });
      setLocation("/admin");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Admin Registration Failed",
        description: err?.message ?? "Please check the access code and try again.",
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
                <ShieldPlus className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Admin Registration</h1>
              <p className="text-sm text-muted-foreground mt-2">Requires a valid access code.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} autoComplete="new-password" {...field} />
                        <button type="button" onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="adminToken" render={({ field }) => (
                  <FormItem><FormLabel>Access code</FormLabel><FormControl><Input type="password" placeholder="Enter admin access code" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating admin..." : (<>Create Admin Account <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
              </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already an admin?{" "}
              <Link href="/admin/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
