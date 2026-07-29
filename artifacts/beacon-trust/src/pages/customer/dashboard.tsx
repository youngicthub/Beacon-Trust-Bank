import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Building,
  CreditCard, Clock, ArrowRightLeft, Globe, Landmark, Sparkles,
} from '@/lib/icons';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as any } }),
};

const sparkData = [
  { v: 40 }, { v: 55 }, { v: 48 }, { v: 70 }, { v: 62 }, { v: 85 }, { v: 78 }, { v: 95 },
];

type AccountRow = {
  id: string;
  accountNumber: string;
  type: string;
  balance: number | string;
};
type TransactionRow = {
  id: string;
  description: string | null;
  amount: number | string;
  type: 'credit' | 'debit';
  status: string;
  createdAt: string;
};

type Summary = {
  accounts: AccountRow[];
  totalBalance: number;
  investmentBalance: number;
  loanOutstanding: number;
  cardCount: number;
  recentTransactions: TransactionRow[];
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await apiFetch<Summary>('/api/dashboard/summary');
        if (mounted) setSummary(data);
      } catch (e) {
        console.error('dashboard load failed', e);
        if (mounted) setIsError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  const formatCurrency = (amount: number | undefined) => {
    const v = amount ?? 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = user?.firstName
    ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    : 'there';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-52 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const s: Summary = summary ?? {
    accounts: [],
    totalBalance: 0,
    investmentBalance: 0,
    loanOutstanding: 0,
    cardCount: 0,
    recentTransactions: [],
  };

  return (
    <DashboardLayout>
      {isError && (
        <div className="mb-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-sm text-amber-700">
          Some data couldn't be loaded. Showing what we have.
        </div>
      )}
      <div className="space-y-8">
        {/* Welcome greeting */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                {greeting}, {displayName}.
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here's an overview of your portfolio today.
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground bg-muted/60 border border-border/50 px-3 py-1.5 rounded-full self-start sm:self-auto">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {/* Hero wealth card */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d2a6b] via-[#1040a0] to-[#1a6dd4] p-8 text-white shadow-2xl">
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-[0.06] flex items-center justify-end pr-8">
              <Landmark className="w-48 h-48" />
            </div>
            <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-12 right-1/4 w-48 h-48 rounded-full bg-blue-300/10 blur-2xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span className="text-blue-200 text-xs font-mono uppercase tracking-widest">Net Worth Overview</span>
                </div>
                <div className="text-5xl md:text-6xl font-mono font-bold tracking-tight">
                  {formatCurrency(s.totalBalance)}
                </div>
                <div className="mt-3 flex items-center gap-2 text-emerald-300 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" /> Across {s.accounts.length} account{s.accounts.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/transfer"
                  className="inline-flex items-center gap-2 bg-white text-[#0d2a6b] font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200"
                >
                  <ArrowRightLeft className="w-4 h-4" /> Move Funds
                </Link>
                <Link
                  href="/accounts"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20"
                >
                  <Wallet className="w-4 h-4" /> Accounts
                </Link>
              </div>
            </div>

            <div className="relative z-10 mt-6 h-16 opacity-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
                  <XAxis dataKey="v" hide />
                  <Tooltip contentStyle={{ display: 'none' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Stat cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: 'Investment Portfolio',
              value: formatCurrency(s.investmentBalance),
              icon: TrendingUp,
              trend: s.investmentBalance > 0 ? 'Active holdings' : 'No investments yet',
              trendColor: 'text-emerald-500',
              accent: 'from-emerald-500/10 to-emerald-500/5',
              iconColor: 'text-emerald-500',
              border: 'border-emerald-500/20',
            },
            {
              label: 'Credit & Liabilities',
              value: formatCurrency(s.loanOutstanding),
              icon: Building,
              trend: s.loanOutstanding > 0 ? 'Outstanding' : 'No active loans',
              trendColor: 'text-amber-500',
              accent: 'from-amber-500/10 to-amber-500/5',
              iconColor: 'text-amber-500',
              border: 'border-amber-500/20',
            },
            {
              label: 'Active Cards',
              value: `${s.cardCount} Card${s.cardCount === 1 ? '' : 's'}`,
              icon: CreditCard,
              trend: s.cardCount > 0 ? 'All in good standing' : 'No cards issued',
              trendColor: 'text-blue-500',
              accent: 'from-blue-500/10 to-blue-500/5',
              iconColor: 'text-blue-500',
              border: 'border-blue-500/20',
            },
          ].map((item, i) => (
            <motion.div key={item.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible">
              <Card className={`border ${item.border} shadow-sm overflow-hidden bg-gradient-to-br ${item.accent} hover:shadow-md transition-shadow duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{item.label}</span>
                    <div className={`p-2 rounded-lg bg-background/60 ${item.iconColor}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-mono font-bold text-foreground">{item.value}</div>
                  <div className={`text-xs font-medium mt-2 ${item.trendColor}`}>{item.trend}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent transactions */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold tracking-tight">Recent Transactions</h2>
              <Link href="/transactions" className="text-sm text-primary font-medium hover:underline">View All →</Link>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="divide-y divide-border/40">
                {s.recentTransactions.length > 0 ? (
                  s.recentTransactions.map((tx, idx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.06, duration: 0.4 }}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 transition-transform group-hover:scale-110 duration-200 ${
                          tx.type === 'credit'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-primary/8 text-primary/70'
                        }`}>
                          {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{tx.description ?? 'Transaction'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground font-mono">{format(new Date(tx.createdAt), 'MMM dd, yyyy')}</span>
                            {tx.status === 'pending' && (
                              <span className="text-[10px] bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`font-mono font-semibold text-right tabular-nums ${tx.type === 'credit' ? 'text-emerald-500' : 'text-foreground'}`}>
                        {tx.type === 'credit' ? '+' : '−'}{formatCurrency(Number(tx.amount))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-3">
                    <Clock className="w-10 h-10 opacity-15" />
                    <p className="text-sm">No recent transactions</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Right column */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
            <div>
              <h2 className="text-xl font-serif font-bold tracking-tight mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: '/transfer', icon: ArrowRightLeft, label: 'Transfer', color: 'from-blue-500/15 to-blue-500/5 border-blue-500/20 text-blue-600' },
                  { href: '/transfer', icon: Globe, label: 'International', color: 'from-purple-500/15 to-purple-500/5 border-purple-500/20 text-purple-600' },
                  { href: '/cards', icon: CreditCard, label: 'Cards', color: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-600' },
                  { href: '/investments', icon: TrendingUp, label: 'Invest', color: 'from-amber-500/15 to-amber-500/5 border-amber-500/20 text-amber-600' },
                ].map(({ href, icon: Icon, label, color }) => (
                  <Link
                    key={label}
                    href={href}
                    className={`bg-gradient-to-br ${color} border p-4 rounded-xl flex flex-col items-center justify-center gap-2.5 hover:scale-105 transition-all duration-200 text-center group shadow-sm hover:shadow-md`}
                  >
                    <div className="p-2.5 rounded-xl bg-background/60 group-hover:scale-110 transition-transform duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif font-bold text-base">My Accounts</h3>
                <Link href="/accounts" className="text-xs text-primary font-medium hover:underline">View All</Link>
              </div>
              {s.accounts.length > 0 ? (
                <div className="space-y-2.5">
                  {s.accounts.slice(0, 3).map((account, idx) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.07 }}
                    >
                      <Link
                        href={`/accounts/${account.id}`}
                        className="flex justify-between items-center p-3.5 bg-card border border-border/50 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-200">
                            <Wallet className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-medium text-sm capitalize">{account.type}</div>
                            <div className="text-xs text-muted-foreground font-mono">****{account.accountNumber.slice(-4)}</div>
                          </div>
                        </div>
                        <div className="font-mono font-semibold text-sm tabular-nums">{formatCurrency(Number(account.balance))}</div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground bg-card border border-border/50 rounded-xl">
                  <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No accounts yet</p>
                </div>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&q=80"
                alt="Global transfers"
                className="w-full h-28 object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d2a6b]/80 to-transparent flex items-center p-4">
                <div>
                  <div className="text-white text-xs font-mono uppercase tracking-wider mb-1">Global Transfers</div>
                  <Link href="/transfer" className="text-white text-sm font-semibold hover:underline flex items-center gap-1">
                    Send anywhere <Globe className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
