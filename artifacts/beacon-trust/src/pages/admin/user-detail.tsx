import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { useParams, Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User as UserIcon, Mail, Phone, Calendar, MapPin, ShieldCheck, CreditCard, Wallet, DollarSign, CheckCircle2, XCircle, Clock, Trash2 } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const fundSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  note: z.string().optional(),
});
type FundFormValues = z.infer<typeof fundSchema>;

type UserDetail = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
};

type AccountRow = {
  id: string;
  account_number: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
};

type KycRow = {
  id: string;
  status: string;
  document_type: string;
  document_number: string;
  created_at: string;
} | null;

export default function AdminUserDetail() {
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [kyc, setKyc] = useState<KycRow>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [fundOpen, setFundOpen] = useState(false);
  const [fundLoading, setFundLoading] = useState(false);
  const [accountActionLoading, setAccountActionLoading] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fundForm = useForm<FundFormValues>({
    resolver: zodResolver(fundSchema),
    defaultValues: { amount: 0, note: '' },
  });

  useEffect(() => {
    if (!userId) return;
    fetchUser();
    fetchAccounts();
  }, [userId]);

  const fetchUser = async () => {
    setUserLoading(true);
    const [userRes, kycRes] = await Promise.all([
      supabase
        .from('users')
        .select('id, email, first_name, last_name, role, phone, date_of_birth, address, is_active, created_at')
        .eq('id', userId)
        .single(),
      supabase
        .from('kyc_records')
        .select('id, status, document_type, document_number, created_at')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);
    if (!userRes.error) setUser(userRes.data as UserDetail);
    if (!kycRes.error) setKyc(kycRes.data as KycRow);
    setUserLoading(false);
  };

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('id, account_number, type, balance, currency, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error) setAccounts((data ?? []) as AccountRow[]);
    setAccountsLoading(false);
  };

  const toggleUserStatus = async () => {
    if (!user) return;
    setUpdatingStatus(true);
    const { error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', userId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    } else {
      setUser(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
      toast({ title: 'Updated', description: `User is now ${!user.is_active ? 'active' : 'inactive'}.` });
    }
    setUpdatingStatus(false);
  };

  const handleAccountAction = async (accountId: string, action: 'approve' | 'reject') => {
    setAccountActionLoading(accountId);
    const newStatus = action === 'approve' ? 'active' : 'closed';
    const { error } = await supabase
      .from('accounts')
      .update({ status: newStatus })
      .eq('id', accountId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: newStatus } : a));
      toast({
        title: action === 'approve' ? 'Account Approved' : 'Account Rejected',
        description: action === 'approve'
          ? 'The account is now active.'
          : 'The account request has been declined.',
      });
    }
    setAccountActionLoading(null);
  };

  const onFundSubmit = async (data: FundFormValues) => {
    // Find the primary active account
    const primaryAccount = accounts.find(a => a.status === 'active');
    if (!primaryAccount) {
      toast({ variant: 'destructive', title: 'No Active Account', description: 'User has no active account to fund.' });
      return;
    }
    setFundLoading(true);
    const newBalance = primaryAccount.balance + data.amount;
    const { error: accErr } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', primaryAccount.id);

    if (accErr) {
      toast({ variant: 'destructive', title: 'Error', description: accErr.message });
      setFundLoading(false);
      return;
    }

    // Create a transaction record
    await supabase.from('transactions').insert({
      account_id: primaryAccount.id,
      type: 'credit',
      amount: data.amount,
      description: data.note || 'Admin credit',
      status: 'completed',
    });

    setAccounts(prev => prev.map(a => a.id === primaryAccount.id ? { ...a, balance: newBalance } : a));
    toast({ title: 'Account Funded', description: `$${data.amount.toFixed(2)} added successfully.` });
    setFundOpen(false);
    fundForm.reset();
    setFundLoading(false);
  };

  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      // cascade: transactions → accounts → other records → user
      const accountIds = accounts.map(a => a.id);
      if (accountIds.length > 0) {
        await supabase.from('transactions').delete().in('account_id', accountIds);
        await supabase.from('accounts').delete().in('id', accountIds);
      }
      await supabase.from('kyc_records').delete().eq('user_id', userId);
      await supabase.from('beneficiaries').delete().eq('user_id', userId);
      await supabase.from('support_tickets').delete().eq('user_id', userId);
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      toast({ title: 'Customer Deleted', description: 'Customer and all associated data have been permanently removed.' });
      setLocation('/admin/users');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: err?.message ?? 'Unable to delete customer.' });
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const getAccountStatusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === 'pending' || status === 'pending_approval') return <Clock className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
            </Button>
          </Link>
        </div>

        {userLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : !user ? (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
            <UserIcon className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">User Not Found</h3>
          </div>
        ) : (
          <>
            {/* User Profile Card */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className={`h-1.5 w-full ${user.is_active ? 'bg-primary' : 'bg-destructive'}`} />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-serif font-bold">
                        {user.first_name} {user.last_name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{user.role}</Badge>
                        <Badge variant={user.is_active ? 'default' : 'destructive'} className="text-[10px]">
                          {user.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                        {kyc?.status === 'verified' && (
                          <div className="flex items-center gap-1 text-emerald-600 text-xs">
                            <ShieldCheck className="h-3.5 w-3.5" /> KYC Verified
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={toggleUserStatus}
                        disabled={updatingStatus}
                      />
                      <span className="text-xs text-muted-foreground">
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <Button onClick={() => setFundOpen(true)} size="sm">
                      <DollarSign className="mr-1.5 h-4 w-4" /> Fund Account
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteOpen(true)}
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" /> Delete Customer
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.date_of_birth && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Born {format(new Date(user.date_of_birth), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{user.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Joined {format(new Date(user.created_at), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KYC Status */}
            {kyc && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> KYC Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium capitalize">{kyc.document_type}</span> — {kyc.document_number}
                    </div>
                    <Badge
                      variant={kyc.status === 'verified' ? 'default' : kyc.status === 'rejected' ? 'destructive' : 'secondary'}
                    >
                      {kyc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted {format(new Date(kyc.created_at), 'MMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Accounts */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                ) : accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No accounts found.</p>
                ) : (
                  <div className="space-y-3">
                    {accounts.map(account => (
                      <div
                        key={account.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-background/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">{account.account_number}</span>
                              <Badge variant="outline" className="text-[10px] uppercase">{account.type}</Badge>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getAccountStatusIcon(account.status)}
                              <span className="text-xs text-muted-foreground capitalize">
                                {account.status.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-lg">
                            {formatCurrency(account.balance, account.currency)}
                          </span>
                          {(account.status === 'pending' || account.status === 'pending_approval') && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAccountAction(account.id, 'reject')}
                                disabled={accountActionLoading === account.id}
                                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                              >
                                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAccountAction(account.id, 'approve')}
                                disabled={accountActionLoading === account.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href={`/admin/transactions?userId=${userId}`}>
                <Button variant="outline" size="sm">View Transactions</Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Delete Customer Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete Customer
            </DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{user?.first_name} {user?.last_name}</strong> and all
              associated accounts, transactions, KYC records, and support tickets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : 'Yes, Delete Permanently'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fund Account Dialog */}
      <Dialog open={fundOpen} onOpenChange={setFundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> Fund Account
            </DialogTitle>
            <DialogDescription>
              Add funds to {user?.first_name} {user?.last_name}'s primary account.
            </DialogDescription>
          </DialogHeader>
          <Form {...fundForm}>
            <form onSubmit={fundForm.handleSubmit(onFundSubmit)} className="space-y-4 pt-2">
              <FormField control={fundForm.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold">$</span>
                      <Input type="number" step="0.01" min="0.01" {...field} className="pl-8 font-mono" placeholder="0.00" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={fundForm.control} name="note" render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Initial deposit, bonus credit..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setFundOpen(false)} disabled={fundLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={fundLoading}>
                  {fundLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : 'Confirm Funding'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
