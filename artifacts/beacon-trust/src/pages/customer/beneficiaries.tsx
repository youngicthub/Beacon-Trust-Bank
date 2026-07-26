import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, UserPlus, Users } from '@/lib/icons';

const beneficiarySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  bank_name: z.string().optional(),
  account_number: z.string().min(5, 'Account number is required'),
  ifsc_code: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});
type BeneficiaryForm = z.infer<typeof beneficiarySchema>;

type BeneficiaryRow = {
  id: string;
  name: string;
  bank_name: string | null;
  account_number: string;
  ifsc_code: string | null;
  email: string | null;
};

export default function Beneficiaries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<BeneficiaryForm>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: { name: '', bank_name: '', account_number: '', ifsc_code: '', email: '' },
  });

  const load = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('id, name, bank_name, account_number, ifsc_code, email')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setBeneficiaries((data ?? []) as BeneficiaryRow[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const onSubmit = async (data: BeneficiaryForm) => {
    if (!user) return;
    const { error } = await supabase.from('beneficiaries').insert({
      user_id: user.id,
      name: data.name,
      bank_name: data.bank_name || null,
      account_number: data.account_number,
      ifsc_code: data.ifsc_code || null,
      email: data.email || null,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add beneficiary.' });
    } else {
      setIsOpen(false);
      form.reset();
      toast({ title: 'Beneficiary Added', description: 'The beneficiary has been successfully saved.' });
      load();
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('beneficiaries').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove beneficiary.' });
    } else {
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      toast({ title: 'Beneficiary Removed', description: 'The beneficiary has been deleted.' });
    }
    setDeletingId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Beneficiaries</h1>
            <p className="text-muted-foreground mt-1">Manage your saved contacts for quick transfers.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <UserPlus className="mr-2 h-4 w-4" /> Add Beneficiary
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Beneficiary</DialogTitle>
                <DialogDescription>Enter the banking details of the recipient.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="account_number" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number *</FormLabel>
                      <FormControl><Input {...field} placeholder="1234567890" className="font-mono" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bank_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl><Input {...field} placeholder="Chase Bank" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="ifsc_code" render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC / SWIFT Code</FormLabel>
                      <FormControl><Input {...field} placeholder="ABCD0001234" className="font-mono uppercase" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input {...field} type="email" placeholder="john@example.com" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Saving…' : 'Save Beneficiary'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : beneficiaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beneficiaries.map((ben) => (
              <Card key={ben.id} className="p-6 border-border/50 hover:border-primary/30 transition-all shadow-sm flex justify-between items-start group">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{ben.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-mono text-muted-foreground">{ben.account_number}</p>
                    {ben.bank_name && (
                      <p className="text-xs text-muted-foreground">
                        {ben.bank_name}{ben.ifsc_code && ` • ${ben.ifsc_code}`}
                      </p>
                    )}
                    {ben.email && <p className="text-xs text-muted-foreground">{ben.email}</p>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(ben.id)}
                  disabled={deletingId === ben.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-card border border-border/50 rounded-xl flex flex-col items-center">
            <Users className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium">No Beneficiaries</h3>
            <p className="text-muted-foreground">You haven't saved any recipients yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
