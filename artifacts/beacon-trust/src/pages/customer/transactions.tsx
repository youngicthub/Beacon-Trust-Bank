import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Search, Filter } from '@/lib/icons';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type TxRow = {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string | null;
  category: string | null;
  reference: string | null;
  createdAt: string;
};

export default function Transactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch<{ transactions: TxRow[] }>('/api/transactions');
        setTransactions(data.transactions);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load transactions';
        toast({ variant: 'destructive', title: 'Error', description: msg });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const filtered = transactions.filter(tx => {
    const matchesSearch = !searchTerm ||
      (tx.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.reference ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = txFilter === 'all' || tx.type === txFilter;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Transaction History</h1>
          <p className="text-muted-foreground mt-1">Review all your inbound and outbound flows.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search descriptions, references..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50 font-mono text-sm h-10"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(['all', 'credit', 'debit'] as const).map(f => (
              <Badge
                key={f}
                variant={txFilter === f ? 'default' : 'outline'}
                className={`cursor-pointer h-8 flex items-center gap-1 capitalize ${f === 'credit' && txFilter !== f ? 'text-emerald-500 border-emerald-500/30' : ''}`}
                onClick={() => setTxFilter(f)}
              >
                {f === 'all' ? <><Filter className="w-3 h-3" /> All</> : f === 'credit' ? 'Inbound' : 'Outbound'}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="divide-y divide-border/50">
            {isLoading ? (
              [...Array(5)].map((_, i) => <div key={i} className="p-5"><Skeleton className="h-12 w-full" /></div>)
            ) : filtered.length > 0 ? (
              filtered.map((tx) => (
                <div key={tx.id} className="flex flex-col sm:flex-row justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full flex-shrink-0 shadow-sm ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-background border border-border text-foreground/70'}`}>
                      {tx.type === 'credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-base text-foreground mb-1">{tx.description || 'Transaction'}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted-foreground">
                        <span className="bg-muted px-2 py-0.5 rounded text-foreground/80">
                          {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {tx.category && <span className="uppercase tracking-wider">{tx.category}</span>}
                        {tx.reference && <span className="opacity-60">Ref: {tx.reference}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col justify-between items-end sm:items-end sm:justify-center pl-16 sm:pl-0">
                    <div className={`font-mono font-bold text-lg ${tx.type === 'credit' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <div className="flex gap-2 items-center mt-1">
                      {tx.status === 'pending' && <span className="text-[10px] bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Pending</span>}
                      {tx.status === 'failed' && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Failed</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <p>No transactions found matching your criteria.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
