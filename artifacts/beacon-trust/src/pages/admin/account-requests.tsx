import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle, Wallet, User, RefreshCw } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Link } from 'wouter';

type AccountRequest = {
  id: string;
  userId: string;
  accountNumber: string;
  type: string;
  currency: string;
  balance: string;
  status: string;
  createdAt: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

type FilterType = 'pending' | 'active' | 'rejected';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminAccountRequests() {
  const [filter, setFilter] = useState<FilterType>('pending');
  const [accounts, setAccounts] = useState<AccountRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { fetchAccounts(); }, [filter]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const statusMap: Record<FilterType, string> = { pending: 'pending', active: 'active', rejected: 'closed' };
      const data = await apiFetch<AccountRequest[]>(`/api/admin/accounts?status=${statusMap[filter]}`);
      setAccounts(data ?? []);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message });
    }
    setIsLoading(false);
  };

  const handleAction = async (accountId: string, action: 'approve' | 'reject') => {
    setActingId(accountId);
    const newStatus = action === 'approve' ? 'active' : 'closed';
    try {
      await apiFetch(`/api/admin/accounts/${accountId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setAccounts(prev => prev.filter(a => a.id !== accountId));
      toast({
        title: action === 'approve' ? 'Account Approved' : 'Account Rejected',
        description: action === 'approve' ? 'The account is now active and ready to use.' : 'The account request has been declined.',
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message });
    }
    setActingId(null);
  };

  const formatCurrency = (amount: string | number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Account Requests</h1>
            <p className="text-muted-foreground mt-1">Review and approve customer account applications.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAccounts} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit border border-border/50">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map(acc => (
              <Card key={acc.id} className="border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold">{acc.accountNumber}</span>
                          <Badge variant="outline" className="uppercase text-[10px]">{acc.type}</Badge>
                          <Badge variant="outline" className="text-[10px]">{acc.currency}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          Balance: {formatCurrency(acc.balance, acc.currency)}
                        </div>
                        {(acc.firstName || acc.email) && (
                          <div className="flex items-center gap-1 mt-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <Link href={`/admin/users/${acc.userId}`} className="text-xs text-primary hover:underline">
                              {acc.firstName} {acc.lastName} ({acc.email})
                            </Link>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(acc.createdAt), 'MMM d, yyyy, h:mm a')}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {filter === 'pending' && (
                        <>
                          <Button variant="outline" size="sm"
                            onClick={() => handleAction(acc.id, 'reject')} disabled={actingId === acc.id}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10">
                            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                          </Button>
                          <Button size="sm"
                            onClick={() => handleAction(acc.id, 'approve')} disabled={actingId === acc.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
                          </Button>
                        </>
                      )}
                      {filter === 'active' && (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                          <CheckCircle2 className="h-4 w-4" /> Approved
                        </div>
                      )}
                      {filter === 'rejected' && (
                        <div className="flex items-center gap-1.5 text-destructive text-sm font-medium">
                          <XCircle className="h-4 w-4" /> Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-lg font-medium">
              {filter === 'pending' ? 'No Pending Requests' : filter === 'active' ? 'No Approved Accounts' : 'No Rejected Requests'}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">Nothing to show here yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
