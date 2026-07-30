import { useState, useRef, useCallback, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, ShieldAlert, Clock, AlertTriangle, Upload, X, CheckCircle2, ChevronRight, ChevronLeft, User, FileText, Camera } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Document Details', icon: FileText },
  { id: 3, label: 'Upload Images', icon: Camera },
];

const DOC_TYPES = [
  { value: 'passport', label: 'International Passport' },
  { value: 'nationalId', label: 'National Identity Card' },
  { value: 'driverLicense', label: "Driver's License" },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageDropzone({ label, value, onChange, required }: {
  label: string; value: string | null; onChange: (b64: string | null) => void; required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return;
    if (file.size > 5 * 1024 * 1024) { alert('File must be under 5 MB'); return; }
    const b64 = await fileToBase64(file);
    onChange(b64);
  }, [onChange]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/30">
          <img src={value} alt={label} className="w-full h-40 object-contain" />
          <button type="button" onClick={() => onChange(null)} className="absolute top-2 right-2 bg-background/80 border border-border rounded-full p-1 hover:bg-destructive/10 hover:text-destructive">
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Uploaded
          </div>
        </div>
      ) : (
        <div
          className={cn('border-2 border-dashed rounded-xl p-8 flex flex-col items-center text-center cursor-pointer transition-colors', dragging ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50 hover:bg-muted/20')}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Drop file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF · max 5 MB</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

type KycRecord = {
  status: string;
  documentType: string;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

export default function Kyc() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [kycRecord, setKycRecord] = useState<KycRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '', dateOfBirth: '', nationality: '', address: '',
    documentType: 'passport', documentNumber: '',
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch<KycRecord | null>('/api/kyc');
        setKycRecord(data);
      } catch { /* ignore */ }
      setIsLoading(false);
    };
    load();
  }, [user?.id]);

  const next = () => {
    if (step === 1 && (!formData.fullName || !formData.dateOfBirth)) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in all required fields.' });
      return;
    }
    if (step === 2 && (!formData.documentType || !formData.documentNumber)) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in document details.' });
      return;
    }
    setStep(s => s + 1);
  };

  const submit = async () => {
    if (!frontImage) {
      toast({ variant: 'destructive', title: 'Missing document', description: 'Please upload the front of your document.' });
      return;
    }
    if (!user) return;
    setSubmitting(true);
    try {
      await apiFetch('/api/kyc', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality || null,
          address: formData.address || null,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          documentFrontImage: frontImage,
          documentBackImage: backImage || null,
        }),
      });
      toast({ title: 'Submitted!', description: 'Your documents are under review.' });
      setKycRecord({ status: 'pending', documentType: formData.documentType, createdAt: new Date().toISOString(), reviewedAt: null, rejectionReason: null });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: err.message ?? 'Please try again.' });
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return <DashboardLayout><div className="space-y-4"><Skeleton className="h-32 rounded-xl" /></div></DashboardLayout>;
  }

  const statusConfig = {
    verified: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-500/10', label: 'Identity Verified', desc: 'Your identity has been successfully verified.' },
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Under Review', desc: 'Your documents are being reviewed by our team.' },
    rejected: { icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Verification Failed', desc: 'Your documents were rejected. Please resubmit.' },
  };

  if (kycRecord && kycRecord.status !== 'rejected') {
    const cfg = statusConfig[kycRecord.status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = cfg.icon;
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
          <h1 className="text-3xl font-serif font-bold">KYC Verification</h1>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className={`w-20 h-20 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`h-10 w-10 ${cfg.color}`} />
              </div>
              <h2 className="text-xl font-bold mb-2">{cfg.label}</h2>
              <p className="text-muted-foreground mb-4">{cfg.desc}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Submitted: {format(new Date(kycRecord.createdAt), 'MMM d, yyyy')}</p>
                {kycRecord.reviewedAt && <p>Reviewed: {format(new Date(kycRecord.reviewedAt), 'MMM d, yyyy')}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold">KYC Verification</h1>
          <p className="text-muted-foreground mt-1">Verify your identity to unlock all banking features.</p>
        </div>

        {kycRecord?.status === 'rejected' && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Previous submission rejected</p>
              {kycRecord.rejectionReason && <p className="text-sm text-destructive/80 mt-0.5">{kycRecord.rejectionReason}</p>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={cn('flex items-center gap-1.5 text-sm font-medium', active ? 'text-primary' : done ? 'text-emerald-600' : 'text-muted-foreground')}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center', active ? 'bg-primary text-primary-foreground' : done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <span>{s.id}</span>}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${step > s.id ? 'bg-emerald-500' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6 space-y-4">
            {step === 1 && (
              <>
                <h2 className="font-semibold text-lg">Personal Information</h2>
                <div className="space-y-3">
                  <div><Label>Full Legal Name <span className="text-destructive">*</span></Label><Input value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} placeholder="As it appears on your ID" className="mt-1" /></div>
                  <div><Label>Date of Birth <span className="text-destructive">*</span></Label><Input type="date" value={formData.dateOfBirth} onChange={e => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))} className="mt-1 font-mono" /></div>
                  <div><Label>Nationality</Label><Input value={formData.nationality} onChange={e => setFormData(p => ({ ...p, nationality: e.target.value }))} placeholder="e.g. United States" className="mt-1" /></div>
                  <div><Label>Residential Address</Label><Input value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="Full address" className="mt-1" /></div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="font-semibold text-lg">Document Details</h2>
                <div className="space-y-3">
                  <div>
                    <Label>Document Type <span className="text-destructive">*</span></Label>
                    <Select value={formData.documentType} onValueChange={v => setFormData(p => ({ ...p, documentType: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{DOC_TYPES.map(dt => <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Document Number <span className="text-destructive">*</span></Label><Input value={formData.documentNumber} onChange={e => setFormData(p => ({ ...p, documentNumber: e.target.value }))} placeholder="Exact number on document" className="mt-1 font-mono uppercase" /></div>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="font-semibold text-lg">Upload Document Images</h2>
                <div className="space-y-4">
                  <ImageDropzone label="Document Front" value={frontImage} onChange={setFrontImage} required />
                  <ImageDropzone label="Document Back (optional)" value={backImage} onChange={setBackImage} />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2 border-t border-border/50">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={next} className="flex-1">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={submit} disabled={submitting} className="flex-1 h-11">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…
                    </span>
                  ) : <><ShieldCheck className="mr-2 h-4 w-4" /> Submit for Verification</>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
