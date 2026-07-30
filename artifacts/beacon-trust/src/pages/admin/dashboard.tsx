import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Wallet, ArrowRightLeft, ShieldCheck, HelpCircle, TrendingUp, Building, UserPlus, Activity } from '@/lib/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] as any } }),
};

type TrendPoint = { month: string; income: number; expenses: number };
type Signup = { id: string; firstName: string; lastName: string; email: string; createdAt: string; kycStatus: string | null };
type Analytics = {
  totalCustomers: number;
  totalDeposits: number;
  totalLoans: number;
  totalTransactions: number;
  totalAccounts: number;
  pendingKyc: number;
  openTickets: number;
  transactionTrends: TrendPoint[];
  recentSignups: Signup[];
};

export default function AdminDashboard() {
  const { data: analytics, isLoading, isError, error } = useQuery<Analytics>({
    queryKey: ['admin', 'analytics'],
    queryFn: () => apiFetch<Analytics>('/api/admin/analytics'),
  });

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !analytics) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground bg-card rounded-xl border border-border/50">
          <p>Failed to load analytics. Please try again later.</p>
          {error instanceof Error && <p className="mt-2 text-xs">{error.message}</p>}
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: 'Total Customers', value: analytics.totalCustomers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/20' },
    { label: 'Total Deposits', value: formatCurrency(analytics.totalDeposits), icon: Wallet, color: 'text-emerald-500', bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/20' },
    { label: 'Active Loans', value: formatCurrency(analytics.totalLoans), icon: Building, color: 'text-purple-500', bg: 'from-purple-500/10 to-purple-500/5', border: 'border-purple-500/20' },
    { label: 'Transactions', value: analytics.totalTransactions.toLocaleString(), icon: ArrowRightLeft, color: 'text-indigo-500', bg: 'from-indigo-500/10 to-indigo-500/5', border: 'border-indigo-500/20' },
    { label: 'Active Accounts', value: analytics.totalAccounts.toLocaleString(), icon: TrendingUp, color: 'text-cyan-500', bg: 'from-cyan-500/10 to-cyan-500/5', border: 'border-cyan-500/20' },
    { label: 'Pending KYC', value: analytics.pendingKyc.toLocaleString(), icon: ShieldCheck, color: 'text-amber-500', bg: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/20' },
    { label: 'Open Tickets', value: analytics.openTickets.toLocaleString(), icon: HelpCircle, color: 'text-rose-500', bg: 'from-rose-500/10 to-rose-500/5', border: 'border-rose-500/20' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">System Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time platform metrics and system health.</p>
          </div>
          <Link
            href="/admin/create-account"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-200"
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div key={card.label} custom={i + 1} variants={fadeUp} initial="hidden" animate="visible">
              <Card className={`border ${card.border} bg-gradient-to-br ${card.bg} shadow-sm hover:shadow-md transition-shadow duration-300`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground leading-tight">{card.label}</p>
                    <div className={`p-1.5 rounded-lg bg-background/60 ${card.color}`}>
                      <card.icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-3">
            <Card className="border-border/50 shadow-sm h-full">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Transaction Volume</CardTitle>
                </div>
                <CardDescription>Monthly inflows vs outflows (last 6 months)</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pt-4">
                {analytics.transactionTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.transactionTrends} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} tick={{ fontSize: 11 }} width={55} />
                      <Tooltip
                        cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: 12 }}
                        formatter={(val: number) => formatCurrency(val)}
                      />
                      <Bar dataKey="income" name="Inflow" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Outflow" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No trend data available</div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible" className="lg:col-span-2">
            <Card className="border-border/50 shadow-sm flex flex-col h-full">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base">Recent Signups</CardTitle>
                    </div>
                    <CardDescription>New customer registrations</CardDescription>
                  </div>
                  <Link href="/admin/users" className="text-xs text-primary hover:underline font-medium">View All</Link>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto pt-2">
                <div className="divide-y divide-border/40">
                  {analytics.recentSignups.length > 0 ? (
                    analytics.recentSignups.map((user, i) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.06 }}
                        className="py-3 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                          <div>
                            <Link href={`/admin/users/${user.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                              {user.firstName} {user.lastName}
                            </Link>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground font-mono">{format(new Date(user.createdAt), 'MMM dd')}</span>
                          <Badge
                            variant={user.kycStatus === 'verified' ? 'outline' : 'secondary'}
                            className={`text-[10px] ${user.kycStatus === 'verified' ? 'border-emerald-500/50 text-emerald-600' : ''}`}
                          >
                            {user.kycStatus || 'pending'}
                          </Badge>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">No recent signups</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible">
          <div className="relative rounded-2xl overflow-hidden h-36">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
              alt="Analytics"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d2a6b] via-[#0d2a6b]/80 to-transparent flex items-center px-8">
              <div>
                <h3 className="text-white font-serif font-bold text-xl mb-1">Platform Health</h3>
                <p className="text-blue-200 text-sm">All systems operational. Last audit: today.</p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="ml-auto inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                View Audit Logs
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
