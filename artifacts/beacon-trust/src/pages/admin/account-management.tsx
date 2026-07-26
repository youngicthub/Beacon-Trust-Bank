import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Lock, LockOpen, Search, Wallet, User, CheckCircle2 } from '@/lib/icons';
import { format } from 'date-fns';

type ManagedAccount = {
  id: string;
  user_id: string;
  account_number: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
  user?: { first_name: string | null; last_name: string | null; email: string } | null;
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  frozen: 'bg-red-500/10 text-red-600 border-red-500/20',
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

export default function AdminAccountManagement() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState<string | null>(null);
  const [rows, setRows] = useState<ManagedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    const { data: accs, error } = await supabase
      .from('accounts')
      .select('id,user_id,account_number,type,balance,currency,status,created_at')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setRows([]); setIsLoading(false); return;
    }
    const userIds = Array.from(new Set((accs ?? []).map(a => a.user_id)));
    let userMap = new Map<string, { first_name: string | null; last_name: string | null; email: string }>();
    if (userIds.length) {
      const { data: users } = await supabase.from('users').select('id,first_name,last_name,email').in('id', userIds);
      (users ?? []).forEach(u => userMap.set(u.id, { first_name: u.first_name, last_name: u.last_name, email: u.email }));
    }
    setRows((accs ?? []).map(a => ({ ...a, user: userMap.get(a.user_id) ?? null })) as ManagedAccount[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const setStatus = async (id: string, status: 'active' | 'frozen') => {
    setActing(id);
    const { error } = await supabase.from('accounts').update({ status }).eq('id', id);
    setActing(null);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      return;
    }
    toast({ title: status === 'frozen' ? 'Account locked' : 'Account unlocked' });
    load();
  };

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(Number(amount) || 0);

  const filtered = rows.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.account_number.toLowerCase().includes(q) ||
      (a.user?.email ?? '').toLowerCase().includes(q) ||
      `${a.user?.first_name ?? ''} ${a.user?.last_name ?? ''}`.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Account Management</h1>
            <p className="text-muted-foreground mt-1">Approve, lock, or unlock customer accounts.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or account…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10" />
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          {isLoading ? (
            <CardContent className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </CardContent>
          ) : !filtered.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Wallet className="h-12 w-12 opacity-20 mb-3" />
              <p className="font-medium">{search ? 'No accounts match your search' : 'No accounts found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Account</th>
                    <th className="px-5 py-3 text-left font-medium">Customer</th>
                    <th className="px-5 py-3 text-right font-medium">Balance</th>
                    <th className="px-5 py-3 text-center font-medium">Status</th>
                    <th className="px-5 py-3 text-center font-medium">Since</th>
                    <th className="px-5 py-3 text-center font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filtered.map(acc => (
                    <tr key={acc.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono font-semibold">••••{acc.account_number.slice(-4)}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">{acc.type}</div>
                      </td>
                      <td className="px-5 py-4">
                        {acc.user ? (
                          <>
                            <div className="flex items-center gap-1.5 font-medium"><User className="w-3.5 h-3.5 text-muted-foreground" />{acc.user.first_name} {acc.user.last_name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{acc.user.email}</div>
                          </>
                        ) : <span className="text-muted-foreground text-xs">Unknown</span>}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold">{formatCurrency(acc.balance, acc.currency)}</td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${STATUS_STYLES[acc.status] ?? ''}`}>{acc.status}</Badge>
                      </td>
                      <td className="px-5 py-4 text-center text-xs text-muted-foreground font-mono">{format(new Date(acc.created_at), 'MMM dd, yyyy')}</td>
                      <td className="px-5 py-4 text-center">
                        {acc.status === 'pending' ? (
                          <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10" disabled={acting === acc.id} onClick={() => setStatus(acc.id, 'active')}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                        ) : acc.status === 'frozen' ? (
                          <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10" disabled={acting === acc.id} onClick={() => setStatus(acc.id, 'active')}>
                            <LockOpen className="w-3.5 h-3.5 mr-1" /> Unlock
                          </Button>
                        ) : acc.status === 'active' ? (
                          <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" disabled={acting === acc.id} onClick={() => setStatus(acc.id, 'frozen')}>
                            <Lock className="w-3.5 h-3.5 mr-1" /> Lock
                          </Button>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
