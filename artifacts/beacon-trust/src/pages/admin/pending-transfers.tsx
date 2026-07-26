import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, XCircle, ArrowRightLeft, User } from '@/lib/icons';
import { format } from 'date-fns';
import { Link } from 'wouter';

type PendingTx = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  recipient_name: string | null;
  recipient_account: string | null;
  status: string;
  created_at: string;
  accounts: {
    id: string;
    account_number: string;
    type: string;
    users: { id: string; first_name: string | null; last_name: string | null; email: string } | null;
  } | null;
};

export default function AdminPendingTransfers() {
  const [transfers, setTransfers] = useState<PendingTx[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, type, description, recipient_name, recipient_account, status, created_at, accounts!inner(id, account_number, type, users!inner(id, first_name, last_name, email))')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setTransfers((data as any[]) ?? []);
    }
    setIsLoading(false);
  };

  const handleAction = async (txId: string, action: 'approve' | 'reject') => {
    setActingId(txId);
    const newStatus = action === 'approve' ? 'completed' : 'failed';
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', txId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setTransfers(prev => prev.filter(t => t.id !== txId));
      toast({
        title: action === 'approve' ? 'Transfer Approved' : 'Transfer Rejected',
        description: action === 'approve' ? 'The transfer has been completed.' : 'The transfer has been rejected.',
      });
    }
    setActingId(null);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Pending Transfers</h1>
          <p className="text-muted-foreground mt-1">Review and approve outgoing transfer requests.</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : transfers.length > 0 ? (
          <div className="space-y-3">
            {transfers.map(tx => {
              const acc = tx.accounts;
              const user = acc?.users;
              return (
                <Card key={tx.id} className="border-border/50 shadow-sm border-l-4 border-l-amber-500">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="bg-amber-500/10 p-2.5 rounded-xl shrink-0">
                          <ArrowRightLeft className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{formatCurrency(tx.amount)}</span>
                            <Badge variant="outline" className="text-[10px] uppercase bg-amber-500/10 text-amber-600 border-amber-500/20">
                              {tx.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {tx.description || 'Transfer'}
                            {tx.recipient_name && ` → ${tx.recipient_name}`}
                          </div>
                          {acc && (
                            <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                              From: {acc.account_number}
                            </div>
                          )}
                          {user && (
                            <div className="flex items-center gap-1 mt-1">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <Link href={`/admin/users/${user.id}`} className="text-xs text-primary hover:underline">
                                {user.first_name} {user.last_name}
                              </Link>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {format(new Date(tx.created_at), 'MMM d, yyyy, h:mm a')}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(tx.id, 'reject')}
                          disabled={actingId === tx.id}
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(tx.id, 'approve')}
                          disabled={actingId === tx.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Pending Transfers</h3>
            <p className="text-muted-foreground text-sm mt-1">All transfers have been processed.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
