import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, Ticket, UserCircle, Mail, ChevronRight } from '@/lib/icons';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type UserResult = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
};

export default function StaffDashboard() {
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
      .select('id, first_name, last_name, email, role, is_active')
      .or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
      .limit(6);
    setResults((data ?? []) as UserResult[]);
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Staff Portal</h1>
          <p className="text-muted-foreground mt-1">Search clients and manage support requests.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/staff/customers">
            <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-all cursor-pointer group p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Client Directory</h3>
                <p className="text-sm text-muted-foreground">Search and view customer profiles</p>
              </div>
            </Card>
          </Link>
          <Link href="/staff/tickets">
            <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-all cursor-pointer group p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Ticket className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Support Tickets</h3>
                <p className="text-sm text-muted-foreground">Manage customer inquiries</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Quick Search */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Quick Client Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={isLoading}>Search</Button>
            </form>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
              </div>
            ) : searched && (
              results.length > 0 ? (
                <div className="space-y-2">
                  {results.map(user => (
                    <Link key={user.id} href={`/staff/customers/${user.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-border/50">
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase">{user.role}</Badge>
                          {!user.is_active && <Badge variant="destructive" className="text-[10px]">Suspended</Badge>}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No results found.</p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
