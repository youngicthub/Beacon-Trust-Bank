import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare, Plus } from '@/lib/icons';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject is required'),
  description: z.string().min(10, 'Please provide more detail'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});
type FormVals = z.infer<typeof ticketSchema>;

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  staffNotes: string | null;
  createdAt: string;
};

const statusColor = (s: string) => ({
  open: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  inProgress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
}[s] ?? 'bg-muted');

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: '', description: '', priority: 'medium' },
  });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiFetch<Ticket[]>('/api/support/tickets');
      setTickets(data ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const onSubmit = async (values: FormVals) => {
    try {
      await apiFetch('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setOpen(false);
      form.reset();
      toast({ title: 'Ticket created', description: 'Our concierge team will respond shortly.' });
      load();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message ?? 'Failed to submit.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Support Concierge</h1>
            <p className="text-muted-foreground mt-1">Direct channel to your private banking team.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> New Request</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Submit Inquiry</DialogTitle>
                <DialogDescription>Securely message your relationship manager.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="Brief summary" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem><FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Details</FormLabel><FormControl><Textarea placeholder="How can we assist?" className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="pt-2 flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Sending…' : 'Send Secure Message'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4"><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-32 w-full rounded-xl" /></div>
        ) : tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map(t => (
              <Card key={t.id} className="border-border/50 shadow-sm overflow-hidden hover:border-primary/30 transition-colors">
                <CardHeader className="bg-muted/10 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> {t.subject}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-2">TK-{t.id.slice(0, 8).toUpperCase()} • {format(new Date(t.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                    <Badge className={statusColor(t.status)} variant="outline">{t.status.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.description}</p>
                  {t.staffNotes && (
                    <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">BT</div>
                        <span className="text-sm font-bold text-primary">Beacon Trust Team</span>
                      </div>
                      <p className="text-sm text-foreground/90 italic">{t.staffNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card flex flex-col items-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium">No Support History</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">You don't have any support requests yet. Our concierge is ready when you need us.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
