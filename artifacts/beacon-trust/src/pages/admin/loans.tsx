import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, CheckCircle, XCircle, FileText } from '@/lib/icons';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

type LoanRow = {
  id: string;
  userId: string;
  amount: string;
  status: string;
  type: string;
  purpose: string | null;
  interestRate: string;
  tenureMonths: number;
  emiAmount: string | null;
  createdAt: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

const statusColor = (s: string) => ({
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  active: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  closed: 'bg-muted text-muted-foreground border-border',
}[s] ?? 'bg-muted text-muted-foreground border-border');

const TABS = [
  { value: 'pending', label: 'Pending Underwriting' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminLoans() {
  const [tab, setTab] = useState('pending');
  const [allLoans, setAllLoans] = useState<LoanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    apiFetch<LoanRow[]>('/api/admin/loans')
      .then(data => setAllLoans(data ?? []))
      .catch((err: any) => toast({ variant: 'destructive', title: 'Error', description: err?.message }))
      .finally(() => setIsLoading(false));
  }, []);

  const loans = allLoans.filter(l => l.status === tab);

  const handleStatusUpdate = async (loanId: string, status: 'approved' | 'rejected') => {
    setActingId(loanId);
    try {
      await apiFetch(`/api/admin/loans/${loanId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setAllLoans(prev => prev.map(l => l.id === loanId ? { ...l, status } : l));
      toast({ title: `Loan ${status}`, description: 'Facility status has been updated.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update loan.' });
    }
    setActingId(null);
  };

  const formatCurrency = (amount: string | number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(amount));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Credit Facilities</h1>
          <p className="text-muted-foreground mt-1">Review and underwrite loan applications.</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-card border border-border/50 p-1 mb-6 flex-wrap h-auto gap-1">
            {TABS.map(t => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>

          {TABS.map(t => (
            <TabsContent key={t.value} value={t.value}>
              {isLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
              ) : loans.length === 0 ? (
                <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
                  <Building className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No {t.label} Loans</h3>
                  <p className="text-muted-foreground text-sm mt-1">Nothing to review at the moment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loans.map(loan => (
                    <Card key={loan.id} className="border-border/50 shadow-sm">
                      <div className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-lg">{formatCurrency(loan.amount)}</span>
                              <Badge variant="outline" className="text-[10px] uppercase">{loan.type}</Badge>
                              <Badge className={`text-xs border capitalize ${statusColor(loan.status)}`}>{loan.status}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {loan.interestRate}% · {loan.tenureMonths}mo
                              {loan.emiAmount && ` · EMI ${formatCurrency(loan.emiAmount)}/mo`}
                            </div>
                            {loan.purpose && <div className="text-xs text-muted-foreground mt-0.5">{loan.purpose}</div>}
                            {(loan.firstName || loan.email) && (
                              <Link href={`/admin/users/${loan.userId}`} className="text-xs text-primary hover:underline mt-1 block">
                                {loan.firstName} {loan.lastName} — {loan.email}
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{format(new Date(loan.createdAt), 'MMM d, yyyy')}</span>
                          {loan.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm"
                                onClick={() => handleStatusUpdate(loan.id, 'rejected')} disabled={actingId === loan.id}
                                className="border-destructive/30 text-destructive hover:bg-destructive/10">
                                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                              </Button>
                              <Button size="sm"
                                onClick={() => handleStatusUpdate(loan.id, 'approved')} disabled={actingId === loan.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
