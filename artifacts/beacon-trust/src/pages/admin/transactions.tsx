import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight } from '@/lib/icons';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Link, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type TxRow = {
  id: string;
  accountId: string;
  type: string;
  amount: string | number;
  status: string;
  category: string | null;
  description: string | null;
  recipientName: string | null;
  recipientAccount: string | null;
  reference: string | null;
  createdAt: string;
  accountNumber: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
};

const LIMIT = 20;

export default function AdminTransactions() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const filterUserId = searchParams.get('userId');

  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { setPage(0); }, [filterUserId]);
  useEffect(() => { fetchTransactions(); }, [page, filterUserId]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(page * LIMIT),
      });
      if (filterUserId) params.set('userId', filterUserId);
      const data = await apiFetch<TxRow[]>(`/api/admin/transactions?${params}`);
      setTransactions(data ?? []);
      setHasMore((data ?? []).length === LIMIT);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message ?? 'Failed to load transactions.' });
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));

  const getStatusColor = (status: string) => ({
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
  }[status] ?? 'bg-muted text-muted-foreground border-border');

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Global Ledger</h1>
            <p className="text-muted-foreground mt-1">System-wide transaction monitoring.</p>
            {filterUserId && (
              <Badge variant="secondary" className="mt-2 font-mono text-xs">
                Filtered by User · <Link href="/admin/transactions" className="underline ml-1">Clear</Link>
              </Badge>
            )}
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Date & Ref</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Account / User</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Details</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4"><Skeleton className="h-10 w-full" /></td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                        </div>
                        {tx.reference && (
                          <div className="font-mono text-xs text-muted-foreground/60">{tx.reference}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {tx.accountNumber && (
                          <>
                            <div className="font-mono text-xs">{tx.accountNumber}</div>
                            {tx.userId && (
                              <Link
                                href={`/admin/users/${tx.userId}`}
                                className="text-xs text-primary hover:underline"
                              >
                                {tx.firstName} {tx.lastName}
                              </Link>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{tx.description || '—'}</div>
                        {tx.recipientName && (
                          <div className="text-xs text-muted-foreground">→ {tx.recipientName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className={`flex items-center justify-end gap-1.5 font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-foreground'}`}>
                          {tx.type === 'credit'
                            ? <ArrowUpRight className="h-4 w-4" />
                            : <ArrowDownRight className="h-4 w-4" />
                          }
                          {formatCurrency(tx.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className={`capitalize text-xs border ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
            <span>{isLoading ? '—' : `Page ${page + 1}`}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || isLoading}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={!hasMore || isLoading}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
