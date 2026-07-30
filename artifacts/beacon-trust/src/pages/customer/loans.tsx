import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Calculator } from '@/lib/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

type LoanRow = {
  id: string;
  type: string;
  status: string;
  amount: string;
  interestRate: string;
  tenureMonths: number;
  emiAmount: string | null;
  purpose: string | null;
  createdAt: string;
};

const applySchema = z.object({
  type: z.enum(['personal', 'home', 'auto', 'education', 'business']),
  amount: z.coerce.number().positive(),
  tenureMonths: z.coerce.number().positive(),
  purpose: z.string().min(5),
});

const statusColor = (s: string) => ({
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  active: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  closed: 'bg-muted text-muted-foreground border-border',
}[s] ?? 'bg-muted text-muted-foreground border-border');

export default function LoansPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calcResult, setCalcResult] = useState<{ emi: number; totalInterest: number; totalAmount: number } | null>(null);

  const applyForm = useForm<z.infer<typeof applySchema>>({
    resolver: zodResolver(applySchema),
    defaultValues: { type: 'personal', amount: 0, tenureMonths: 12, purpose: '' },
  });

  const calcForm = useForm({
    defaultValues: { amount: 100000, interest_rate: 6.5, tenure_months: 120 },
  });

  const loadLoans = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await apiFetch<LoanRow[]>('/api/loans');
      setLoans(data ?? []);
    } catch { /* ignore */ }
    setIsLoading(false);
  };

  useEffect(() => { loadLoans(); }, [user?.id]);

  const onApply = async (data: z.infer<typeof applySchema>) => {
    if (!user) return;
    try {
      await apiFetch('/api/loans', {
        method: 'POST',
        body: JSON.stringify({ type: data.type, amount: data.amount, tenureMonths: data.tenureMonths, purpose: data.purpose }),
      });
      applyForm.reset();
      toast({ title: 'Application Submitted', description: 'Your loan application is under review.' });
      loadLoans();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit application.' });
    }
  };

  const onCalculate = (data: any) => {
    const { amount, interest_rate, tenure_months } = data;
    const monthlyRate = interest_rate / 100 / 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure_months)) /
      (Math.pow(1 + monthlyRate, tenure_months) - 1);
    const totalAmount = emi * tenure_months;
    setCalcResult({
      emi: Math.round(emi * 100) / 100,
      totalInterest: Math.round((totalAmount - amount) * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Credit & Lending</h1>
          <p className="text-muted-foreground mt-1">Manage your active credit facilities and explore new options.</p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50 p-1">
            <TabsTrigger value="active">Active Loans</TabsTrigger>
            <TabsTrigger value="apply">Apply</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {isLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : loans.length > 0 ? (
              <div className="space-y-4">
                {loans.map(loan => (
                  <Card key={loan.id} className="border-border/50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xl">{formatCurrency(Number(loan.amount))}</span>
                            <Badge variant="outline" className="uppercase text-[10px]">{loan.type}</Badge>
                            <Badge className={`text-[10px] border capitalize ${statusColor(loan.status)}`}>{loan.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {loan.interestRate}% APR · {loan.tenureMonths} months
                            {loan.emiAmount && ` · EMI ${formatCurrency(Number(loan.emiAmount))}/mo`}
                          </p>
                          {loan.purpose && <p className="text-xs text-muted-foreground mt-1">{loan.purpose}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(loan.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
                <Building className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Active Loans</h3>
                <p className="text-muted-foreground text-sm">Apply for a loan to get started.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="apply" className="mt-6">
            <Card className="border-border/50 shadow-sm max-w-xl">
              <CardHeader><CardTitle>Loan Application</CardTitle></CardHeader>
              <CardContent>
                <Form {...applyForm}>
                  <form onSubmit={applyForm.handleSubmit(onApply)} className="space-y-4">
                    <FormField control={applyForm.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={applyForm.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount ($)</FormLabel>
                        <FormControl><Input type="number" {...field} className="font-mono" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={applyForm.control} name="tenureMonths" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenure (Months)</FormLabel>
                        <FormControl><Input type="number" {...field} className="font-mono" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={applyForm.control} name="purpose" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose</FormLabel>
                        <FormControl><Input {...field} placeholder="Brief description of loan purpose" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="pt-4">
                      <Button type="submit" className="w-full" disabled={applyForm.formState.isSubmitting}>
                        {applyForm.formState.isSubmitting ? 'Submitting…' : 'Submit Application'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" /> Scenario Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...calcForm}>
                    <form onSubmit={calcForm.handleSubmit(onCalculate)} className="space-y-4">
                      <FormField control={calcForm.control} name="amount" render={({ field }) => (
                        <FormItem><FormLabel>Loan Amount ($)</FormLabel><FormControl><Input type="number" {...field} className="font-mono" /></FormControl></FormItem>
                      )} />
                      <FormField control={calcForm.control} name="interest_rate" render={({ field }) => (
                        <FormItem><FormLabel>Interest Rate (% APR)</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="font-mono" /></FormControl></FormItem>
                      )} />
                      <FormField control={calcForm.control} name="tenure_months" render={({ field }) => (
                        <FormItem><FormLabel>Tenure (Months)</FormLabel><FormControl><Input type="number" {...field} className="font-mono" /></FormControl></FormItem>
                      )} />
                      <Button type="submit" variant="secondary" className="w-full mt-4">Calculate EMI</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {calcResult && (
                <Card className="border-border/50 shadow-sm bg-primary/5 border-primary/20">
                  <CardHeader><CardTitle>Calculation Result</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between border-b border-primary/10 pb-2">
                      <span className="text-muted-foreground">Monthly EMI</span>
                      <span className="font-mono font-bold text-xl">{formatCurrency(calcResult.emi)}</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/10 pb-2">
                      <span className="text-muted-foreground">Total Interest</span>
                      <span className="font-mono font-bold text-destructive">{formatCurrency(calcResult.totalInterest)}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-muted-foreground">Total Payment</span>
                      <span className="font-mono font-bold">{formatCurrency(calcResult.totalAmount)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
