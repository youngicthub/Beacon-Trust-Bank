import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, ShieldCheck, CheckCircle2, Eye, EyeOff, KeyRound } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';

const createAccountSchema = z.object({
  adminToken: z.string().min(1, 'Access code is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['customer', 'staff', 'admin']),
  phone: z.string().optional(),
  initialBalance: z.coerce.number().min(0).optional(),
});

type CreateAccountForm = z.infer<typeof createAccountSchema>;

export default function AdminCreateAccount() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdUser, setCreatedUser] = useState<{ firstName: string; lastName: string; email: string; role: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { role: 'customer', initialBalance: 0 },
  });

  const onSubmit = async (data: CreateAccountForm) => {
    setIsSubmitting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('admin-create-account', {
        body: data,
      });

      if (error) {
        const message = (result as any)?.error || error.message || 'An error occurred.';
        toast({
          variant: 'destructive',
          title: 'Failed to create account',
          description: message,
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

      setCreatedUser({ firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role });
      setStep('success');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Network error',
        description: err?.message || 'Could not reach the server.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3">
            <UserPlus className="w-7 h-7 text-primary" /> Create Account
          </h1>
          <p className="text-muted-foreground mt-1">Provision a new user account. Requires your admin token for authorization.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <Card className="border-border/50 shadow-lg">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" /> Account Provisioning
                  </CardTitle>
                  <CardDescription>All fields marked * are required. The admin token authorizes this action.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Admin token */}
                      <FormField control={form.control} name="adminToken" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Admin Token *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showToken ? 'text' : 'password'}
                                className="h-12 pr-10 font-mono bg-amber-500/5 border-amber-500/30 focus:border-amber-500"
                                placeholder="Enter your admin authorization token"
                              />
                              <button type="button" onClick={() => setShowToken(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">This token is required to provision accounts. Contact your system administrator if you don't have one.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="border-t border-border/50 pt-5 space-y-5">
                        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">User Information</p>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="firstName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl><Input {...field} className="h-11" placeholder="John" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="lastName" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl><Input {...field} className="h-11" placeholder="Smith" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl><Input {...field} type="email" className="h-11" placeholder="john.smith@example.com" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temporary Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input {...field} type={showPassword ? 'text' : 'password'} className="h-11 pr-10" placeholder="Min. 8 characters" />
                                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Role *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="customer">Customer</SelectItem>
                                  <SelectItem value="staff">Staff</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (optional)</FormLabel>
                              <FormControl><Input {...field} className="h-11" placeholder="+1 555 000 0000" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <FormField control={form.control} name="initialBalance" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Account Balance (USD)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">$</span>
                                <Input type="number" step="0.01" min={0} {...field} className="h-11 pl-7 font-mono" />
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs">A checking account will be created with this starting balance.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</span>
                          ) : (
                            <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Create Account</span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'success' && createdUser && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <Card className="border-border/50 shadow-lg">
                <div className="p-12 text-center flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-500/20"
                  >
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-3xl font-serif font-bold mb-2">Account Created</h2>
                  <p className="text-muted-foreground mb-6">
                    The account for <span className="font-semibold text-foreground">{createdUser.firstName} {createdUser.lastName}</span> has been provisioned.
                  </p>
                  <div className="bg-muted/40 border border-border/50 rounded-xl p-5 text-left w-full max-w-sm mb-8 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-mono font-medium">{createdUser.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Role</span>
                      <span className="capitalize font-medium">{createdUser.role}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => { form.reset(); setStep('form'); }}>Create Another</Button>
                    <Button onClick={() => navigate('/admin/users')}>View All Users</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
