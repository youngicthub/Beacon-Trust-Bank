import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CreditCard, Snowflake, Play, Plus } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';

type CardRow = {
  id: string;
  account_id: string;
  type: string;
  status: string;
  last_4: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  network: string | null;
};

type AccountRow = {
  id: string;
  account_number: string;
  type: string;
};

const requestCardSchema = z.object({
  account_id: z.string().min(1, 'Account required'),
  type: z.enum(['debit', 'virtual']),
});

export default function Cards() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<CardRow[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof requestCardSchema>>({
    resolver: zodResolver(requestCardSchema),
    defaultValues: { type: 'virtual' },
  });

  const load = async () => {
    if (!user) return;
    setIsLoading(true);
    const [cardsRes, accountsRes] = await Promise.all([
      supabase.from('cards').select('id, account_id, type, status, last_4, cardholder_name, expiry_month, expiry_year, network').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('accounts').select('id, account_number, type').eq('user_id', user.id).eq('status', 'active'),
    ]);
    setCards((cardsRes.data ?? []) as CardRow[]);
    setAccounts((accountsRes.data ?? []) as AccountRow[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const onSubmit = async (data: z.infer<typeof requestCardSchema>) => {
    if (!user) return;
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear() + 3;
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const { error } = await supabase.from('cards').insert({
      user_id: user.id,
      account_id: data.account_id,
      type: data.type,
      status: 'pending',
      last_4: last4,
      cardholder_name: `${user.firstName} ${user.lastName}`.trim() || 'CARDHOLDER',
      expiry_month: month,
      expiry_year: year,
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setIsOpen(false);
      form.reset();
      toast({ title: 'Card Requested', description: 'Your new card request has been processed.' });
      load();
    }
  };

  const toggleFreeze = async (card: CardRow) => {
    const isFrozen = card.status === 'frozen';
    setTogglingId(card.id);
    const { error } = await supabase
      .from('cards')
      .update({ status: isFrozen ? 'active' : 'frozen' })
      .eq('id', card.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update card status.' });
    } else {
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: isFrozen ? 'active' : 'frozen' } : c));
      toast({ title: isFrozen ? 'Card Unfrozen' : 'Card Frozen', description: `Card ending in ${card.last_4} status updated.` });
    }
    setTogglingId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Cards Management</h1>
            <p className="text-muted-foreground mt-1">Control your physical and virtual debit cards.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Request New Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a New Card</DialogTitle>
                <DialogDescription>Choose an account and card type.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField control={form.control} name="account_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {accounts.map(a => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.account_number} ({a.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="virtual">Virtual Card</SelectItem>
                          <SelectItem value="debit">Physical Debit Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Requesting…' : 'Request Card'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(card => (
              <div key={card.id} className="flex flex-col gap-4">
                <div className={`relative rounded-2xl p-6 min-h-[180px] overflow-hidden flex flex-col justify-between ${
                  card.status === 'frozen' ? 'bg-muted border border-dashed border-border' :
                  card.type === 'debit' ? 'bg-foreground' : 'bg-primary'
                }`}>
                  <div className="flex justify-between items-start relative z-20">
                    <CreditCard className={`h-8 w-8 ${card.type === 'debit' && card.status !== 'frozen' ? 'text-accent opacity-80' : 'text-primary-foreground/80'}`} />
                    <div className="text-right">
                      <span className={`font-serif italic text-lg tracking-widest ${card.type === 'debit' && card.status !== 'frozen' ? 'text-accent opacity-80' : 'text-primary-foreground/80'}`}>
                        {card.type === 'debit' ? 'Obsidian' : 'Virtual'}
                      </span>
                      {card.status === 'pending' && <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-none text-[10px]">PENDING</Badge>}
                      {card.status === 'frozen' && <Badge variant="secondary" className="ml-2 text-[10px]">FROZEN</Badge>}
                    </div>
                  </div>
                  <div className="relative z-20">
                    <div className={`font-mono text-lg tracking-[0.2em] mb-2 ${card.status === 'frozen' ? 'text-muted-foreground' : 'text-white'}`}>
                      •••• •••• •••• {card.last_4}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className={`uppercase tracking-widest text-sm ${card.status === 'frozen' ? 'text-muted-foreground' : 'text-white/70'}`}>
                        {card.cardholder_name || 'Cardholder'}
                      </div>
                      <div className={`font-mono text-sm ${card.status === 'frozen' ? 'text-muted-foreground' : 'text-white/70'}`}>
                        {String(card.expiry_month).padStart(2, '0')}/{String(card.expiry_year).slice(-2)}
                      </div>
                    </div>
                  </div>
                </div>

                {card.status !== 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={`flex-1 ${card.status === 'frozen' ? 'text-emerald-500 hover:text-emerald-600' : 'text-blue-500 hover:text-blue-600'}`}
                      onClick={() => toggleFreeze(card)}
                      disabled={togglingId === card.id}
                    >
                      {card.status === 'frozen'
                        ? <><Play className="mr-2 h-4 w-4" /> Unfreeze</>
                        : <><Snowflake className="mr-2 h-4 w-4" /> Freeze</>
                      }
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-card border border-border/50 rounded-xl flex flex-col items-center">
            <CreditCard className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-medium">No Cards</h3>
            <p className="text-muted-foreground">You don't have any active cards.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
