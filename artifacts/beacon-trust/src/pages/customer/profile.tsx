import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  phone: z.string().min(7, 'Valid phone required'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', phone: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      await apiFetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      toast({ title: 'Profile Updated', description: 'Your personal information has been saved.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      await apiFetch('/api/profile/password', {
        method: 'PATCH',
        body: JSON.stringify({ newPassword: data.newPassword }),
      });
      passwordForm.reset();
      toast({ title: 'Security Updated', description: 'Your password has been changed successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message ?? 'Failed to update password.' });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-48" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and security.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Keep your details up to date.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                      <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                      <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Email Address</FormLabel>
                    <Input value={user?.email || ''} disabled className="bg-muted text-muted-foreground font-mono" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed directly for security reasons.</p>
                  </div>
                  <FormField control={profileForm.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} className="font-mono" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="pt-4">
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                      {profileForm.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                    <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="pt-4">
                    <Button type="submit" variant="destructive" disabled={passwordForm.formState.isSubmitting}>
                      {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
