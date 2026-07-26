import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Shield, Activity } from '@/lib/icons';
import { useToast } from '@/hooks/use-toast';

type AuditRow = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  created_at: string;
};

const LIMIT = 50;

const actionColor = (action: string) => {
  if (action.includes('login') || action.includes('register')) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
  if (action.includes('delete') || action.includes('reject')) return 'bg-destructive/10 text-destructive border-destructive/20';
  if (action.includes('approve') || action.includes('verify')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  return 'bg-muted text-muted-foreground border-border';
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('id, user_id, action, entity_type, entity_id, ip_address, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * LIMIT, page * LIMIT + LIMIT - 1);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setLogs((data ?? []) as AuditRow[]);
      setTotal(count ?? 0);
    }
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Audit & Security Logs</h1>
            <p className="text-muted-foreground mt-1">Immutable record of system activity.</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left font-mono">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 font-medium tracking-wider">User</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Action</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Entity</th>
                  <th className="px-6 py-4 font-medium tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors text-xs sm:text-sm">
                      <td className="px-6 py-3 whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {log.user_id ? (
                          <Link href={`/admin/users/${log.user_id}`} className="text-primary hover:underline">
                            {log.user_id.substring(0, 8)}…
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <Badge className={`text-[10px] border ${actionColor(log.action)}`}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {log.entity_type ? (
                          <span>{log.entity_type}{log.entity_id ? ` #${log.entity_id.substring(0, 8)}` : ''}</span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {log.ip_address ?? '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
            <span>{isLoading ? '—' : `${total} total entries`}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || isLoading}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * LIMIT >= total || isLoading}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
