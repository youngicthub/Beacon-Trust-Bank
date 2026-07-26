import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Globe, Users, Clock, Loader2 } from '@/lib/icons';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

type AccountRow = { id: string; account_number: string; type: string; balance: number; currency: string };
type BeneficiaryRow = { id: string; name: string; account_number: string; bank_name: string | null };

const transferSchema = z
  .object({
    from_account_id: z.string().min(1, 'Please select a source account'),
    transfer_type: z.enum(['internal', 'external', 'international']),
    to_account_number: z.string().optional(),
    beneficiary_id: z.string().optional(),
    recipient_name: z.string().optional(),
    recipient_bank: z.string().optional(),
    swift_code: z.string().optional(),
    amount: z.coerce.number({ invalid_type_error: 'Please enter an amount' }).positive('Amount must be greater than 0'),
    description: z.string().min(1, 'Description / reference is required'),
  })
  .superRefine((data, ctx) => {
    if (data.transfer_type === 'internal') {
      if (!data.to_account_number || data.to_account_number.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Destination account number is required', path: ['to_account_number'] });
      }
    }
    if (data.transfer_type === 'external') {
      if (!data.beneficiary_id || data.beneficiary_id.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a beneficiary', path: ['beneficiary_id'] });
      }
    }
    if (data.transfer_type === 'international') {
      if (!data.recipient_name || data.recipient_name.trim() === '')
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Recipient name is required', path: ['recipient_name'] });
      if (!data.recipient_bank || data.recipient_bank.trim() === '')
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Recipient bank is required', path: ['recipient_bank'] });
      if (!data.swift_code || data.swift_code.trim() === '')
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'SWIFT / BIC code is required', path: ['swift_code'] });
      if (!data.to_account_number || data.to_account_number.trim() === '')
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Account / IBAN is required', path: ['to_account_number'] });
    }
  });

type TransferFormValues = z.infer<typeof transferSchema>;

const TYPE_OPTIONS = [
  { value: 'internal', label: 'Own Account', desc: 'Between your accounts', icon: ShieldCheck },
  { value: 'external', label: 'Beneficiary', desc: 'Saved contacts', icon: Users },
  { value: 'international', label: 'International Wire', desc: 'Global SWIFT transfer', icon: Globe },
];

const fmt = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export default function Transfer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<TransferFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    const load = async () => {
      const [accRes, benRes] = await Promise.all([
        supabase.from('accounts').select('id, account_number, type, balance, currency').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('beneficiaries').select('id, name, account_number, bank_name').eq('user_id', user.id),
      ]);
      setAccounts((accRes.data ?? []) as AccountRow[]);
      setBeneficiaries((benRes.data ?? []) as BeneficiaryRow[]);
      setLoadingData(false);
    };
    load();
  }, [user?.id]);

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transfer_type: 'external',
      description: '',
      from_account_id: '',
      beneficiary_id: '',
      to_account_number: '',
      recipient_name: '',
      recipient_bank: '',
      swift_code: '',
    },
  });

  const watchType = form.watch('transfer_type');
  const watchAmount = form.watch('amount');
  const watchFromId = form.watch('from_account_id');
  const fromAccount = accounts.find(a => a.id === watchFromId);

  const onNext = form.handleSubmit((data) => {
    setFormData(data);
    setStep(2);
  });

  // Derive human-readable recipient info for the confirm screen
  const getRecipientSummary = (data: TransferFormValues) => {
    if (data.transfer_type === 'internal') {
      return { label: 'To Account', value: data.to_account_number ?? '—' };
    }
    if (data.transfer_type === 'external') {
      const ben = beneficiaries.find(b => b.id === data.beneficiary_id);
      return { label: 'Beneficiary', value: ben ? `${ben.name} (${ben.account_number})` : '—' };
    }
    // international
    return { label: 'Recipient', value: `${data.recipient_name ?? ''} — ${data.recipient_bank ?? ''} — ${data.swift_code ?? ''} — ${data.to_account_number ?? ''}` };
  };

  const onConfirm = async () => {
    if (!formData || !user) return;
    setIsSubmitting(true);

    const fromAcc = accounts.find(a => a.id === formData.from_account_id);
    if (!fromAcc) { setIsSubmitting(false); return; }

    if (formData.amount > fromAcc.balance) {
      toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'Not enough funds in the selected account.' });
      setIsSubmitting(false);
      return;
    }

    let recipientName = formData.recipient_name ?? '';
    let recipientAccount = formData.to_account_number ?? '';

    if (formData.transfer_type === 'external' && formData.beneficiary_id) {
      const ben = beneficiaries.find(b => b.id === formData.beneficiary_id);
      if (ben) { recipientName = ben.name; recipientAccount = ben.account_number; }
    }

    const { error } = await supabase.from('transactions').insert({
      account_id: formData.from_account_id,
      type: 'debit',
      amount: formData.amount,
      description: formData.description,
      recipient_name: recipientName || null,
      recipient_account: recipientAccount || null,
      status: 'pending',
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Transfer Failed', description: error.message });
    } else {
      setStep(3);
    }
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Transfer Funds</h1>
          <p className="text-muted-foreground mt-1">Send money securely, anywhere in the world.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</div>
              {s < 3 && <div className={`h-0.5 flex-1 w-12 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <Form {...form}>
                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

                      {/* Transfer Type */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Transfer Type</Label>
                        <div className="grid grid-cols-3 gap-3">
                          {TYPE_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            const active = watchType === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  form.setValue('transfer_type', opt.value as TransferFormValues['transfer_type'], { shouldValidate: false });
                                  // Clear conditional fields when switching type
                                  form.setValue('to_account_number', '');
                                  form.setValue('beneficiary_id', '');
                                  form.setValue('recipient_name', '');
                                  form.setValue('recipient_bank', '');
                                  form.setValue('swift_code', '');
                                }}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${active ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/40'}`}
                              >
                                <Icon className={`h-5 w-5 mb-1 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                                <p className={`text-sm font-semibold ${active ? 'text-primary' : ''}`}>{opt.label}</p>
                                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* From Account */}
                      <FormField
                        control={form.control}
                        name="from_account_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Account</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || undefined}
                              disabled={loadingData}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  {loadingData ? (
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading accounts…
                                    </span>
                                  ) : (
                                    <SelectValue placeholder="Select an account" />
                                  )}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accounts.length === 0 ? (
                                  <div className="py-4 px-3 text-sm text-center text-muted-foreground">
                                    No active accounts found
                                  </div>
                                ) : (
                                  accounts.map(a => (
                                    <SelectItem key={a.id} value={a.id}>
                                      <span className="font-mono">{a.account_number}</span>
                                      <span className="ml-2 text-muted-foreground">— {fmt(a.balance, a.currency)}</span>
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* To (internal) */}
                      {watchType === 'internal' && (
                        <FormField control={form.control} name="to_account_number" render={({ field }) => (
                          <FormItem>
                            <FormLabel>To Account Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Destination account number" className="font-mono" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}

                      {/* To (external — beneficiary) */}
                      {watchType === 'external' && (
                        <FormField
                          control={form.control}
                          name="beneficiary_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Beneficiary</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || undefined}
                                disabled={loadingData}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a beneficiary" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {beneficiaries.length === 0 ? (
                                    <div className="py-4 px-3 text-sm text-center text-muted-foreground">
                                      No beneficiaries saved yet
                                    </div>
                                  ) : (
                                    beneficiaries.map(b => (
                                      <SelectItem key={b.id} value={b.id}>
                                        {b.name} — <span className="font-mono">{b.account_number}</span>
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {/* International fields */}
                      {watchType === 'international' && (
                        <div className="space-y-4">
                          <FormField control={form.control} name="recipient_name" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipient Name</FormLabel>
                              <FormControl><Input {...field} placeholder="Full name of recipient" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="recipient_bank" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recipient Bank</FormLabel>
                              <FormControl><Input {...field} placeholder="Bank name" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="swift_code" render={({ field }) => (
                            <FormItem>
                              <FormLabel>SWIFT / BIC Code</FormLabel>
                              <FormControl><Input {...field} className="font-mono uppercase" placeholder="e.g. CHASUS33" onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="to_account_number" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account / IBAN</FormLabel>
                              <FormControl><Input {...field} className="font-mono" placeholder="IBAN or account number" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}

                      {/* Amount */}
                      <FormField control={form.control} name="amount" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (USD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold select-none">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                className="pl-7 font-mono"
                                {...field}
                                value={field.value ?? ''}
                                onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.value)}
                              />
                            </div>
                          </FormControl>
                          {fromAccount && watchAmount > fromAccount.balance && (
                            <p className="text-xs text-destructive font-medium">
                              Exceeds available balance ({fmt(fromAccount.balance, fromAccount.currency)})
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Description */}
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description / Reference</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Rent payment, Invoice #123…" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <Button type="button" onClick={onNext} className="w-full h-12 mt-2" disabled={loadingData}>
                        Review Transfer →
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && formData && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Confirm Transfer</CardTitle>
                  <CardDescription>Please review the details before authorizing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 rounded-xl bg-muted/40 p-4 border border-border/50">
                    {(() => {
                      const fromAcc = accounts.find(a => a.id === formData.from_account_id);
                      const recipient = getRecipientSummary(formData);
                      const rows: [string, string][] = [
                        ['Type', TYPE_OPTIONS.find(t => t.value === formData.transfer_type)?.label ?? ''],
                        ['From', fromAcc ? `${fromAcc.account_number} (${fmt(fromAcc.balance, fromAcc.currency)} available)` : '—'],
                        [recipient.label, recipient.value],
                        ['Amount', fmt(formData.amount)],
                        ['Description', formData.description],
                      ];
                      return rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between text-sm gap-4">
                          <span className="text-muted-foreground shrink-0">{label}</span>
                          <span className="font-medium text-right break-all">{value}</span>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Warn if amount exceeds balance */}
                  {(() => {
                    const fromAcc = accounts.find(a => a.id === formData.from_account_id);
                    if (fromAcc && formData.amount > fromAcc.balance) {
                      return (
                        <p className="text-sm text-destructive font-medium">
                          ⚠ Transfer amount exceeds available balance. Please go back and correct the amount.
                        </p>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12" disabled={isSubmitting}>
                      ← Edit
                    </Button>
                    <Button
                      onClick={onConfirm}
                      className="flex-1 h-12"
                      disabled={isSubmitting || (() => {
                        const fromAcc = accounts.find(a => a.id === formData.from_account_id);
                        return !!fromAcc && formData.amount > fromAcc.balance;
                      })()}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Authorizing…
                        </span>
                      ) : 'Authorize & Execute'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <Card className="border-border/50 shadow-lg">
                <div className="p-12 text-center flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-yellow-500/20"
                  >
                    <Clock className="h-12 w-12 text-yellow-500" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-3xl font-serif font-bold mb-2">Transfer Pending</h2>
                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                      Your transfer has been submitted and is pending admin review.
                    </p>
                  </motion.div>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => { form.reset(); setStep(1); }}>New Transfer</Button>
                    <Button onClick={() => setLocation('/transactions')}>View Transactions</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
