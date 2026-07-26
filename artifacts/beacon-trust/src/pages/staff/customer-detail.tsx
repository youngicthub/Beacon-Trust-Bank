import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, UserCircle, Wallet, ArrowUpRight, ArrowDownRight, Mail, Phone, MapPin } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type UserDetail = { id: string; email: string; first_name: string | null; last_name: string | null; phone: string | null; address: string | null; avatar_url: string | null; is_active: boolean; role: string };
type AccountRow = { id: string; account_number: string; type: string; balance: number; currency: string; status: string };
type TxRow = { id: string; amount: number; type: string; status: string; description: string | null; created_at: string; account_id: string };

export default function StaffCustomerDetail() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      const [userRes, accRes] = await Promise.all([
        supabase.from('users').select('id, email, first_name, last_name, phone, address, avatar_url, is_active, role').eq('id', userId).single(),
        supabase.from('accounts').select('id, account_number, type, balance, currency, status').eq('user_id', userId).order('created_at', { ascending: false }),
      ]);
      if (!userRes.error) setUser(userRes.data as UserDetail);
      const accs = (accRes.data ?? []) as AccountRow[];
      setAccounts(accs);

      if (accs.length > 0) {
        const { data: txs } = await supabase
          .from('transactions')
          .select('id, amount, type, status, description, created_at, account_id')
          .in('account_id', accs.map(a => a.id))
          .order('created_at', { ascending: false })
          .limit(10);
        setTransactions((txs ?? []) as TxRow[]);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-40 rounded-xl" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/50">Customer not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <Link href="/staff/customers" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Link>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className={`h-2 w-full ${user.is_active === false ? 'bg-destructive' : 'bg-primary'}`} />
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-24 h-24 rounded-full bg-muted border-4 border-background shadow-md flex items-center justify-center overflow-hidden shrink-0">
              {user.avatar_url
                ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                : <UserCircle className="h-12 w-12 text-muted-foreground/50" />
              }
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-serif font-bold text-foreground">{user.first_name} {user.last_name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2 mb-4">
                <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{user.role}</Badge>
                {!user.is_active && <Badge variant="destructive" className="uppercase text-[10px]">Suspended</Badge>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" />{user.email}</div>
                {user.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" />{user.phone}</div>}
                {user.address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{user.address}</div>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" /> Accounts</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div>
                        <span className="font-mono text-sm font-medium">{acc.account_number}</span>
                        <div className="flex gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[10px] uppercase">{acc.type}</Badge>
                          <Badge variant="outline" className={`text-[10px] capitalize ${acc.status === 'active' ? 'text-emerald-600 border-emerald-500/30' : ''}`}>{acc.status}</Badge>
                        </div>
                      </div>
                      <span className="font-mono font-bold">{formatCurrency(acc.balance, acc.currency)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No accounts.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm flex flex-col">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {transactions.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-foreground/5 text-foreground/70'}`}>
                          {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.description || 'Transaction'}</p>
                          <p className="text-xs text-muted-foreground font-mono">{format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      </div>
                      <div className={`font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-500' : ''}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No transaction history.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
