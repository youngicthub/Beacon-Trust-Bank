import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, CreditCard, ChevronRight, Plus, Clock, CheckCircle2 } from '@/lib/icons';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const requestSchema = z.object({
  type: z.enum(['savings', 'current', 'business', 'investment']),
  currency: z.enum(['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES']),
});
type RequestFormValues = z.infer<typeof requestSchema>;

const ACCOUNT_TYPES = [
  { value: 'current', label: 'Current Account', desc: 'Everyday spending and bill payments' },
  { value: 'savings', label: 'Savings Account', desc: 'Earn interest on deposited funds' },
  { value: 'business', label: 'Business Account', desc: 'For commercial transactions' },
  { value: 'investment', label: 'Investment Account', desc: 'Managed portfolio & yield reserves' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'GHS', 'KES'];

type Account = {
  id: string;
  accountNumber: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
};

export default function Accounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { type: 'current', currency: 'USD' },
  });

  const load = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await apiFetch<{ accounts: Account[] }>('/api/accounts');
      setAccounts(data.accounts);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load accounts';
      toast({ variant: 'destructive', title: 'Error', description: msg });
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const onSubmit = async (values: RequestFormValues) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await apiFetch('/api/accounts', {
        method: 'POST',
        body: JSON.stringify({ type: values.type, currency: values.currency }),
      });
      setDialogOpen(false);
      form.reset();
      toast({ title: 'Account request submitted', description: 'An admin will review and activate it shortly.' });
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      toast({ variant: 'destructive', title: 'Request failed', description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount) || 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const list = accounts ?? [];
  const activeAccounts = list.filter(a => a.status === 'active');
  const pendingAccounts = list.filter(a => a.status === 'pending');
  const otherAccounts = list.filter(a => a.status !== 'active' && a.status !== 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Accounts</h1>
            <p className="text-muted-foreground mt-1">Manage your liquid assets and transactional accounts.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Request New Account
          </Button>
        </div>

        {activeAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeAccounts.map(account => (
              <Link key={account.id} href={`/accounts/${account.id}`}>
                <Card className="bg-card border-border/50 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-lg font-medium capitalize flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      {account.type} Account
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">{account.currency}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-bold text-foreground mt-4 mb-1">
                      {formatCurrency(account.balance, account.currency)}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground tracking-widest">
                          **** {account.accountNumber.slice(-4)}
                        </span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-card border border-border/50 rounded-xl flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <h3 className="text-lg font-semibold">No Active Accounts</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-xs">
              {pendingAccounts.length > 0
                ? "Your account request is being reviewed. You'll be notified once it's approved."
                : "Open a checking or savings account to start banking with Beacon Trust."}
            </p>
            {pendingAccounts.length === 0 && (
              <Button onClick={() => setDialogOpen(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" /> Request an Account
              </Button>
            )}
          </div>
        )}

        {pendingAccounts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-amber-500" />
              <h2 className="text-lg font-semibold text-foreground">Pending Approval</h2>
              <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-[10px] uppercase tracking-wider">
                {pendingAccounts.length} awaiting review
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingAccounts.map(account => (
                <Card key={account.id} className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-base font-medium capitalize flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-amber-500" />
                      {account.type} Account
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">{account.currency}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mt-2">
                      Account **** {account.accountNumber.slice(-4)} · Awaiting admin approval.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {otherAccounts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground border-b border-border/50 pb-2">
              Closed &amp; Suspended Accounts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {otherAccounts.map(account => (
                <Card key={account.id} className="bg-muted/30 border-border/30 opacity-70">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-lg font-medium capitalize text-muted-foreground">
                      {account.type} Account
                    </CardTitle>
                    <Badge variant="secondary" className="uppercase text-[10px]">{account.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-mono font-bold text-muted-foreground mt-2 mb-1">
                      {formatCurrency(account.balance, account.currency)}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground tracking-widest mt-2">
                      **** {account.accountNumber.slice(-4)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Request a New Account
            </DialogTitle>
            <DialogDescription>
              Choose an account type and currency. Your request will be reviewed and activated by an admin.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCOUNT_TYPES.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${
                          field.value === opt.value ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/40'
                        }`}
                      >
                        <p className={`text-sm font-semibold ${field.value === opt.value ? 'text-primary' : ''}`}>{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
