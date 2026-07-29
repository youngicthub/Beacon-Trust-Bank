import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Download, History, CreditCard } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

type Account = {
  id: string;
  accountNumber: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
};

type TxRow = {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  category: string | null;
  reference: string | null;
  recipientName: string | null;
  createdAt: string;
};

export default function AccountDetail() {
  const params = useParams();
  const accountId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId || !user) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<{ account: Account; transactions: TxRow[] }>(`/api/accounts/${accountId}`);
        setAccount(data.account);
        setTransactions(data.transactions);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Account not found';
        toast({ variant: 'destructive', title: 'Account not found', description: msg });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accountId, user?.id]);

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const handleDownload = () => {
    const csv = [
      'Date,Type,Description,Amount,Status',
      ...transactions.map(tx =>
        `${format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm')},${tx.type},${(tx.description || '').replace(/,/g, ' ')},${tx.amount},${tx.status}`
      ),
    ].join('\n');
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    el.download = `statement_${account?.accountNumber}_${format(new Date(), 'yyyy-MM')}.csv`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!account) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
          <p>Account not found or access denied.</p>
          <Link href="/accounts">
            <Button variant="outline" className="mt-4">Return to Accounts</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const totalInflow = transactions.filter(tx => tx.type === 'credit' && tx.status === 'completed').reduce((sum, tx) => sum + Number(tx.amount), 0);
  const totalOutflow = transactions.filter(tx => tx.type === 'debit' && tx.status === 'completed').reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/accounts" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Accounts
        </Link>

        <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <CreditCard className="w-48 h-48 text-primary" />
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-serif font-bold tracking-tight capitalize">{account.type} Account</h1>
                <Badge variant="outline" className={`uppercase ${account.status === 'active' ? 'border-emerald-500 text-emerald-500' : ''}`}>
                  {account.status}
                </Badge>
              </div>
              <p className="font-mono text-muted-foreground tracking-widest bg-muted/50 inline-block px-3 py-1 rounded-md border border-border/50">
                {account.accountNumber.replace(/(.{4})/g, '$1 ').trim()}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-4xl font-mono font-black tracking-tight">
                {formatCurrency(Number(account.balance), account.currency)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Inflow</p>
              <p className="font-mono font-bold text-emerald-500">+{formatCurrency(totalInflow, account.currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Outflow</p>
              <p className="font-mono font-bold">-{formatCurrency(totalOutflow, account.currency)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <History className="h-5 w-5" /> Account Statement
            </h2>
            <Button variant="outline" size="sm" onClick={handleDownload} className="font-mono text-xs h-9">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="divide-y divide-border/50">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full flex-shrink-0 ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-foreground/5 text-foreground/70'}`}>
                      {tx.type === 'credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{tx.description || 'Transaction'}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs font-mono text-muted-foreground">
                        <span>{format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        {tx.reference && <><span>•</span><span>Ref: {tx.reference}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Number(tx.amount), account.currency)}
                    </div>
                    {tx.status === 'pending' && <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Pending</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>No transactions found for this account.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
