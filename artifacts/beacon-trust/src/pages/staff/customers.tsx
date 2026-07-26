import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, UserCircle, Mail, Phone, ShieldCheck, ChevronRight } from '@/lib/icons';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type UserResult = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  is_active: boolean;
  role: string;
  kyc_records: { status: string } | null;
};

export default function StaffCustomers() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setIsLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone, is_active, role, kyc_records(status)')
      .or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    setResults((data as any[]) ?? []);
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Client Directory</h1>
          <p className="text-muted-foreground mt-1">Search the global database to assist clients.</p>
        </div>

        <Card className="bg-card p-2 border border-border/50 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or account number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 border-0 shadow-none focus-visible:ring-0 text-base h-14 bg-transparent font-mono placeholder:font-sans"
              />
            </div>
            <Button type="submit" className="h-14 px-8 text-base bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Searching…' : 'Search'}
            </Button>
          </form>
        </Card>

        {isLoading ? (
          <div className="space-y-4 pt-4">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : searched && (
          <div className="space-y-4 pt-4">
            <div className="text-sm font-medium text-muted-foreground">Found {results.length} result{results.length !== 1 ? 's' : ''} for "{search}"</div>
            {results.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-4">
                {results.map((user) => {
                  const kyc = (user.kyc_records as any)?.status;
                  return (
                    <Link key={user.id} href={`/staff/customers/${user.id}`}>
                      <Card className="p-6 border-border/50 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <UserCircle className="h-8 w-8" />
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                                {user.first_name} {user.last_name}
                              </h3>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="uppercase text-[10px]">{user.role}</Badge>
                                {!user.is_active && <Badge variant="destructive" className="text-[10px]">Suspended</Badge>}
                                {kyc === 'verified' && (
                                  <div className="flex items-center gap-1 text-emerald-600 text-xs">
                                    <ShieldCheck className="h-3.5 w-3.5" /> KYC Verified
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" />{user.email}</div>
                          {user.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" />{user.phone}</div>}
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
                <UserCircle className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Results</h3>
                <p className="text-muted-foreground">No customers matched your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
