import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Ticket, User, Clock, CheckCircle2 } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

type TicketRow = {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  staffNotes: string | null;
  createdAt: string;
  updatedAt: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

const priorityColor = (p: string) => ({
  low: 'bg-muted text-muted-foreground border-border',
  medium: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  high: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
}[p] ?? 'bg-muted text-muted-foreground border-border');

const statusColor = (s: string) => ({
  open: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  inProgress: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  closed: 'bg-muted text-muted-foreground border-border',
}[s] ?? 'bg-muted text-muted-foreground border-border');

export default function StaffTickets() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'inProgress' | 'resolved' | 'closed'>('open');
  const [activeTicket, setActiveTicket] = useState<TicketRow | null>(null);
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchTickets(); }, [filter]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<TicketRow[]>(`/api/staff/tickets?status=${filter}`);
      setTickets(data ?? []);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message ?? 'Failed to load tickets.' });
    }
    setIsLoading(false);
  };

  const openTicket = (ticket: TicketRow) => {
    setActiveTicket(ticket);
    setStatus(ticket.status);
    setNotes(ticket.staffNotes || '');
  };

  const handleUpdate = async () => {
    if (!activeTicket) return;
    setUpdating(true);
    try {
      await apiFetch(`/api/staff/tickets/${activeTicket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, staffNotes: notes }),
      });
      toast({ title: 'Ticket Updated', description: 'Response has been saved.' });
      setActiveTicket(null);
      fetchTickets();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message ?? 'Failed to update ticket.' });
    }
    setUpdating(false);
  };

  const FILTERS = [
    { value: 'open', label: 'Open' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage client support inquiries.</p>
        </div>

        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit border border-border/50">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.value ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="border-border/50 shadow-sm">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                        <Ticket className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold">{ticket.subject}</span>
                          <Badge className={`text-[10px] border capitalize ${statusColor(ticket.status)}`}>{ticket.status.replace(/([A-Z])/g, ' $1')}</Badge>
                          <Badge className={`text-[10px] border capitalize ${priorityColor(ticket.priority)}`}>{ticket.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                        {ticket.userId && (
                          <Link href={`/staff/customers/${ticket.userId}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />{ticket.firstName} {ticket.lastName} — {ticket.email}
                          </Link>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openTicket(ticket)}>
                        Respond
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Inbox Zero</h3>
            <p className="text-muted-foreground">All client inquiries have been handled.</p>
          </div>
        )}

        <Dialog open={!!activeTicket} onOpenChange={(open) => !open && setActiveTicket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Ticket</DialogTitle>
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
                <label className="text-sm font-medium">Response / Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px] font-mono text-sm bg-muted/30"
                  placeholder="Record actions taken..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTicket(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? 'Saving…' : 'Save Response'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
