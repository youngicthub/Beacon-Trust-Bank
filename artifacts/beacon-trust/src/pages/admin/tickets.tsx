import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare } from '@/lib/icons';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Ticket = {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  staffNotes: string | null;
  createdAt: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

const statusColor = (s: string) => ({
  open: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  inProgress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
}[s] ?? '');

const priorityColor = (p: string) => ({
  urgent: 'text-red-600', high: 'text-destructive', medium: 'text-yellow-600', low: 'text-muted-foreground',
}[p] ?? '');

export default function AdminTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [active, setActive] = useState<Ticket | null>(null);
  const [status, setStatus] = useState<string>('open');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Ticket[]>('/api/admin/tickets');
      setTickets(data ?? []);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openModal = (t: Ticket) => { setActive(t); setStatus(t.status); setNotes(t.staffNotes || ''); };

  const save = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/tickets/${active.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, staffNotes: notes }),
      });
      setActive(null);
      toast({ title: 'Ticket updated' });
      load();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message });
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Support Desk</h1>
          <p className="text-muted-foreground mt-1">Manage client inquiries and operational requests.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4"><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-32 w-full rounded-xl" /></div>
        ) : tickets.length > 0 ? (
          <div className="grid gap-4">
            {tickets.map(t => (
              <Card key={t.id} className="border-border/50 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-5 flex-1 border-r border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className={`h-4 w-4 ${priorityColor(t.priority)}`} />
                      <h3 className="font-bold text-lg">{t.subject}</h3>
                    </div>
                    <Badge variant="outline" className={statusColor(t.status)}>{t.status.toUpperCase()}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-mono text-muted-foreground">
                    <span>TK-{t.id.slice(0, 8).toUpperCase()}</span>
                    <span>•</span>
                    <span>{format(new Date(t.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    <span>•</span>
                    <span className="text-primary">
                      {t.firstName || t.email ? `${t.firstName ?? ''} ${t.lastName ?? ''} (${t.email})` : 'Unknown user'}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2">{t.description}</p>
                </div>
                <div className="bg-muted/10 p-5 md:w-64 flex flex-col justify-center shrink-0">
                  <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Staff Notes</div>
                  <p className="text-sm italic line-clamp-3 mb-4">{t.staffNotes || 'No notes yet.'}</p>
                  <Button variant="outline" className="w-full mt-auto" onClick={() => openModal(t)}>Manage Ticket</Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
            <HelpCircle className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Tickets</h3>
            <p className="text-muted-foreground">The support queue is empty.</p>
          </div>
        )}

        <Dialog open={!!active} onOpenChange={o => !o && setActive(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Ticket TK-{active?.id.slice(0, 8).toUpperCase()}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Response / Staff Notes</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[120px] font-mono text-sm bg-muted/30" placeholder="Message to the customer or internal notes…" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
