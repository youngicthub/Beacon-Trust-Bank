import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TrendingUp, PieChart, Plus, AlertTriangle } from '@/lib/icons';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

type InvestmentRow = {
  id: string;
  type: string;
  status: string;
  amount: string;
  createdAt: string;
};

type AccountRow = { balance: string };

const investmentSchema = z.object({
  type: z.enum(['mutualFund', 'fixedDeposit', 'stocks', 'bonds', 'crypto']),
  amount: z.coerce.number().positive('Amount must be positive'),
});

export default function Investments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<InvestmentRow[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof investmentSchema>>({
    resolver: zodResolver(investmentSchema),
    defaultValues: { type: 'mutualFund', amount: 0 },
  });

  const watchedAmount = form.watch('amount');

  const load = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [invData, accData] = await Promise.all([
        apiFetch<InvestmentRow[]>('/api/investments'),
        apiFetch<AccountRow[]>('/api/accounts'),
      ]);
      setInvestments(invData ?? []);
      setAccounts(accData ?? []);
    } catch { /* ignore */ }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0);
  const totalInvested = investments.filter(i => i.status === 'active').reduce((s, i) => s + Number(i.amount), 0);
  const insufficientFunds = Number(watchedAmount) > 0 && Number(watchedAmount) > totalBalance;

  const onSubmit = async (data: z.infer<typeof investmentSchema>) => {
    if (!user) return;
    if (data.amount > totalBalance) {
      toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'Your account balance is too low.' });
      return;
    }
    try {
      await apiFetch('/api/investments', {
        method: 'POST',
        body: JSON.stringify({ type: data.type, amount: data.amount }),
      });
      setIsOpen(false);
      form.reset();
      toast({ title: 'Investment Created', description: 'Your portfolio has been updated.' });
      load();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message ?? 'Failed to create investment.' });
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const RETURN_RATES: Record<string, number> = {
    mutualFund: 12.5, fixedDeposit: 6.5, stocks: 18.2, bonds: 4.8, crypto: 45.0,
  };

  const chartData = Object.entries(
    investments.filter(i => i.status === 'active').reduce<Record<string, number>>((acc, inv) => {
      acc[inv.type] = (acc[inv.type] || 0) + Number(inv.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.replace(/([A-Z])/g, ' $1').trim(), value }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Investment Portfolio</h1>
            <p className="text-muted-foreground mt-1">Manage and grow your wealth intelligently.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Investment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Investment</DialogTitle>
                <DialogDescription>Deploy capital into your chosen asset class.</DialogDescription>
              </DialogHeader>
              {insufficientFunds && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> Insufficient balance for this amount.
                </div>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="mutualFund">Mutual Fund</SelectItem>
                          <SelectItem value="fixedDeposit">Fixed Deposit</SelectItem>
                          <SelectItem value="stocks">Stocks</SelectItem>
                          <SelectItem value="bonds">Bonds</SelectItem>
                          <SelectItem value="crypto">Crypto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                          <Input type="number" step="0.01" {...field} className="pl-7 font-mono" placeholder="0.00" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting || insufficientFunds}>
                      {form.formState.isSubmitting ? 'Creating…' : 'Invest Now'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border/50 shadow-sm p-5">
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-mono font-bold mt-1">{formatCurrency(totalInvested)}</p>
              </Card>
              <Card className="border-border/50 shadow-sm p-5">
                <p className="text-sm text-muted-foreground">Active Holdings</p>
                <p className="text-2xl font-mono font-bold mt-1">{investments.filter(i => i.status === 'active').length}</p>
              </Card>
              <Card className="border-border/50 shadow-sm p-5">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-mono font-bold mt-1">{formatCurrency(totalBalance)}</p>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PieChart className="h-5 w-5" /> Allocation</CardTitle></CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center">
                      <PieChart className="h-16 w-16 text-muted-foreground opacity-20" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-border/50 shadow-sm">
                <CardHeader><CardTitle className="text-lg">Holdings</CardTitle></CardHeader>
                <CardContent>
                  <div className="divide-y divide-border/50">
                    {investments.length > 0 ? (
                      investments.map(inv => (
                        <div key={inv.id} className="py-4 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-muted rounded-xl">
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-normal bg-background">
                                  {inv.type.replace(/([A-Z])/g, ' $1').trim()}
                                </Badge>
                                <Badge className={`text-[10px] capitalize ${inv.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                  {inv.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(inv.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-lg">{formatCurrency(Number(inv.amount))}</p>
                            <p className="text-sm text-emerald-500 font-medium">+{RETURN_RATES[inv.type] ?? 0}% APY</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-muted-foreground">
                        <p>No active investments. Deploy capital to start growing your wealth.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
