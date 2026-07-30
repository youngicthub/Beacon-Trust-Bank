import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
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
  firstName: string | null;
  lastName: string | null;
  role: string;
  phone: string | null;
  dateOfBirth: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
};

type AccountRow = {
  id: string;
  accountNumber: string;
  type: string;
  balance: string;
  currency: string;
  status: string;
  createdAt: string;
};

type KycRow = {
  id: string;
  status: string;
  documentType: string;
  documentNumber: string;
  createdAt: string;
} | null;

export default function AdminUserDetail() {
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [kyc, setKyc] = useState<KycRow>(null);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    apiFetch<{ user: UserDetail; accounts: AccountRow[]; kyc: KycRow }>(`/api/admin/users/${userId}`)
      .then(({ user: u, accounts: a, kyc: k }) => {
        setUser(u);
        setAccounts(a);
        setKyc(k);
      })
      .catch((err: any) => toast({ variant: 'destructive', title: 'Error', description: err?.message }))
      .finally(() => setLoading(false));
  }, [userId]);

  const toggleUserStatus = async () => {
    if (!user) return;
    setUpdatingStatus(true);
    try {
      await apiFetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      toast({ title: 'Updated', description: `User is now ${!user.isActive ? 'active' : 'inactive'}.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
    setUpdatingStatus(false);
  };

  const handleAccountAction = async (accountId: string, action: 'approve' | 'reject') => {
    setAccountActionLoading(accountId);
    const newStatus = action === 'approve' ? 'active' : 'closed';
    try {
      await apiFetch(`/api/admin/accounts/${accountId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: newStatus } : a));
      toast({
        title: action === 'approve' ? 'Account Approved' : 'Account Rejected',
        description: action === 'approve' ? 'The account is now active.' : 'The account request has been declined.',
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message });
    }
    setAccountActionLoading(null);
  };

  const onFundSubmit = async (data: FundFormValues) => {
    setFundLoading(true);
    try {
      const result = await apiFetch<{ newBalance: number }>(`/api/admin/users/${userId}/fund`, {
        method: 'POST',
        body: JSON.stringify({ amount: data.amount, note: data.note }),
      });
      // Refresh accounts to reflect new balance
      const refreshed = await apiFetch<{ user: UserDetail; accounts: AccountRow[]; kyc: KycRow }>(`/api/admin/users/${userId}`);
      setAccounts(refreshed.accounts);
      toast({ title: 'Account Funded', description: `$${data.amount.toFixed(2)} added successfully.` });
      setFundOpen(false);
      fundForm.reset();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message });
    }
    setFundLoading(false);
  };

  const handleDeleteUser = async () => {
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      toast({ title: 'Customer Deleted', description: 'Customer and all associated data have been permanently removed.' });
      setLocation('/admin/users');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: err?.message ?? 'Unable to delete customer.' });
      setDeleteLoading(false);
      setDeleteOpen(false);
    }
  };

  const formatCurrency = (amount: string | number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));

  const getAccountStatusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-amber-500" />;
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

        {loading ? (
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
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className={`h-1.5 w-full ${user.isActive ? 'bg-primary' : 'bg-destructive'}`} />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-full p-3">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-serif font-bold">{user.firstName} {user.lastName}</h1>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{user.role}</Badge>
                        <Badge variant={user.isActive ? 'default' : 'destructive'} className="text-[10px]">
                          {user.isActive ? 'Active' : 'Suspended'}
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
                      <Switch checked={user.isActive} onCheckedChange={toggleUserStatus} disabled={updatingStatus} />
                      <span className="text-xs text-muted-foreground">{user.isActive ? 'Active' : 'Suspended'}</span>
                    </div>
                    <Button onClick={() => setFundOpen(true)} size="sm">
                      <DollarSign className="mr-1.5 h-4 w-4" /> Fund Account
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setDeleteOpen(true)}
                      className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive"
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" /><span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" /><span>{user.phone}</span>
                    </div>
                  )}
                  {user.dateOfBirth && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Born {format(new Date(user.dateOfBirth), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" /><span>{user.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Joined {format(new Date(user.createdAt), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <span className="font-medium capitalize">{kyc.documentType}</span> — {kyc.documentNumber}
                    </div>
                    <Badge variant={kyc.status === 'verified' ? 'default' : kyc.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {kyc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted {format(new Date(kyc.createdAt), 'MMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No accounts found.</p>
                ) : (
                  <div className="space-y-3">
                    {accounts.map(account => (
                      <div key={account.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/50 bg-background/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">{account.accountNumber}</span>
                              <Badge variant="outline" className="text-[10px] uppercase">{account.type}</Badge>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getAccountStatusIcon(account.status)}
                              <span className="text-xs text-muted-foreground capitalize">{account.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-lg">{formatCurrency(account.balance, account.currency)}</span>
                          {account.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm"
                                onClick={() => handleAccountAction(account.id, 'reject')}
                                disabled={accountActionLoading === account.id}
                                className="border-destructive/30 text-destructive hover:bg-destructive/10">
                                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                              </Button>
                              <Button size="sm"
                                onClick={() => handleAccountAction(account.id, 'approve')}
                                disabled={accountActionLoading === account.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white">
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

            <div className="flex flex-wrap gap-3">
              <Link href={`/admin/transactions?userId=${userId}`}>
                <Button variant="outline" size="sm">View Transactions</Button>
              </Link>
            </div>
          </>
        )}
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete Customer
            </DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{user?.firstName} {user?.lastName}</strong> and all
              associated accounts, transactions, KYC records, and support tickets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteUser} disabled={deleteLoading}>
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...
                </span>
              ) : 'Yes, Delete Permanently'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={fundOpen} onOpenChange={setFundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> Fund Account
            </DialogTitle>
            <DialogDescription>
              Add funds to {user?.firstName} {user?.lastName}'s primary active account.
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
                  <FormControl><Input {...field} placeholder="e.g. Initial deposit, bonus credit..." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setFundOpen(false)} disabled={fundLoading}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={fundLoading}>
                  {fundLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
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
