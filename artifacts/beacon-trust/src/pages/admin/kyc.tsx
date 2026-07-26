import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ShieldCheck, Clock, FileText, CheckCircle, XCircle, User, RefreshCw, ChevronDown, ChevronUp, Eye } from '@/lib/icons';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type KycRecord = {
  id: string;
  user_id: string;
  status: 'pending' | 'verified' | 'rejected';
  document_type: string;
  document_number: string;
  full_name: string;
  date_of_birth: string | null;
  address: string | null;
  nationality: string | null;
  document_front_image: string | null;
  document_back_image: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  users: { id: string; email: string; first_name: string | null; last_name: string | null } | null;
};

function DocImage({ src, label }: { src: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <div
          className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/20 cursor-pointer group"
          onClick={() => setOpen(true)}
        >
          <img src={src} alt={label} className="w-full h-32 object-contain" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <Eye className="text-white h-6 w-6 drop-shadow" />
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{label}</DialogTitle></DialogHeader>
          <img src={src} alt={label} className="w-full rounded-xl border border-border/50 object-contain max-h-[70vh]" />
        </DialogContent>
      </Dialog>
    </>
  );
}

function KycCard({ record, onApprove, onReject, approving, rejecting }: {
  record: KycRecord;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  approving: boolean;
  rejecting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const user = record.users;
  const name = user ? `${user.first_name} ${user.last_name}` : record.full_name;
  const isPending = record.status === 'pending';

  return (
    <Card className={cn('border-border/50 shadow-sm overflow-hidden', isPending && 'border-l-4 border-l-amber-500')}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-xl shrink-0', {
            'bg-amber-500/10 text-amber-600': record.status === 'pending',
            'bg-emerald-500/10 text-emerald-600': record.status === 'verified',
            'bg-destructive/10 text-destructive': record.status === 'rejected',
          })}>
            {record.status === 'pending' ? <Clock className="h-5 w-5" /> :
             record.status === 'verified' ? <ShieldCheck className="h-5 w-5" /> :
             <ShieldAlert className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{name}</span>
              <Badge className={cn('text-[10px] border capitalize', {
                'bg-amber-500/10 text-amber-600 border-amber-500/20': record.status === 'pending',
                'bg-emerald-500/10 text-emerald-600 border-emerald-500/20': record.status === 'verified',
                'bg-destructive/10 text-destructive border-destructive/20': record.status === 'rejected',
              })}>
                {record.status}
              </Badge>
            </div>
            {user && (
              <Link href={`/admin/users/${user.id}`} className="text-xs text-primary hover:underline">
                {user.email}
              </Link>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              <span className="uppercase font-mono">{record.document_type}</span> · {record.document_number}
            </div>
            <div className="text-xs text-muted-foreground">
              Submitted {format(new Date(record.created_at), 'MMM d, yyyy')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isPending && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(record.id)}
                disabled={rejecting}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(record.id)}
                disabled={approving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/50 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            {record.full_name && <div><span className="text-muted-foreground">Full Name:</span> {record.full_name}</div>}
            {record.date_of_birth && <div><span className="text-muted-foreground">DOB:</span> {format(new Date(record.date_of_birth), 'MMM d, yyyy')}</div>}
            {record.nationality && <div><span className="text-muted-foreground">Nationality:</span> {record.nationality}</div>}
            {record.address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {record.address}</div>}
            {record.rejection_reason && <div className="col-span-2 text-destructive"><span className="text-muted-foreground">Rejection Reason:</span> {record.rejection_reason}</div>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {record.document_front_image && <DocImage src={record.document_front_image} label="Front" />}
            {record.document_back_image && <DocImage src={record.document_back_image} label="Back" />}
          </div>
        </div>
      )}
    </Card>
  );
}

type FilterType = 'pending' | 'verified' | 'rejected';

export default function AdminKyc() {
  const [filter, setFilter] = useState<FilterType>('pending');
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchKyc();
  }, [filter]);

  const fetchKyc = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('kyc_records')
      .select('id, user_id, status, document_type, document_number, full_name, date_of_birth, address, nationality, document_front_image, document_back_image, rejection_reason, admin_notes, created_at, reviewed_at, users!inner(id, email, first_name, last_name)')
      .eq('status', filter)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setRecords((data as any[]) ?? []);
    }
    setIsLoading(false);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    const { error } = await supabase
      .from('kyc_records')
      .update({ status: 'verified', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setRecords(prev => prev.filter(r => r.id !== id));
      toast({ title: 'KYC Approved', description: 'The identity has been verified successfully.' });
    }
    setApprovingId(null);
  };

  const handleRejectConfirm = async () => {
    if (!rejectId || !rejectionReason.trim()) return;
    const { error } = await supabase
      .from('kyc_records')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', rejectId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setRecords(prev => prev.filter(r => r.id !== rejectId));
      toast({ title: 'KYC Rejected', description: 'The submission has been declined.' });
      setRejectId(null);
      setRejectionReason('');
      setAdminNotes('');
    }
  };

  const FILTERS: { value: FilterType; label: string; icon: React.ReactNode }[] = [
    { value: 'pending', label: 'Pending Review', icon: <Clock className="h-4 w-4" /> },
    { value: 'verified', label: 'Verified', icon: <ShieldCheck className="h-4 w-4" /> },
    { value: 'rejected', label: 'Rejected', icon: <ShieldAlert className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">KYC Reviews</h1>
            <p className="text-muted-foreground mt-1">Verify customer identity documents.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchKyc} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit border border-border/50 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-3">
            {records.map(record => (
              <KycCard
                key={record.id}
                record={record}
                onApprove={handleApprove}
                onReject={(id) => { setRejectId(id); setRejectionReason(''); setAdminNotes(''); }}
                approving={approvingId === record.id}
                rejecting={false}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
            <FileText className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-lg font-medium">
              {filter === 'pending' ? 'No Pending Reviews' : `No ${filter} Records`}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {filter === 'pending' ? 'All submissions have been reviewed.' : 'Nothing to show here yet.'}
            </p>
          </div>
        )}
      </div>

      <Dialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" /> Reject KYC Submission
            </DialogTitle>
            <DialogDescription>
              Provide a clear reason so the user knows exactly what to fix and resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Rejection Reason <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="e.g. Document image is blurry, document has expired, name mismatch..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Internal Admin Notes <span className="text-muted-foreground text-xs">(not shown to user)</span></Label>
              <Textarea
                placeholder="Optional internal notes for your records..."
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim()}
            >
              Reject Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
