import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Bell, ShieldAlert, ArrowRightLeft, FileText, Info, CheckCircle2 } from '@/lib/icons';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type NotifRow = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotifRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, message, type, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setNotifications((data ?? []) as NotifRow[]);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setMarkingId(null);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setMarkingAll(true);
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setMarkingAll(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'security': return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case 'transaction': return <ArrowRightLeft className="h-5 w-5 text-emerald-500" />;
      case 'kyc': return <FileText className="h-5 w-5 text-primary" />;
      case 'loan': return <CheckCircle2 className="h-5 w-5 text-accent" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-sm font-mono px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead} disabled={markingAll}>
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((note) => (
              <Card
                key={note.id}
                className={`p-4 border-border/50 transition-all ${note.is_read ? 'bg-background opacity-70' : 'bg-card border-l-4 border-l-primary shadow-sm'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-full ${note.is_read ? 'bg-muted' : 'bg-primary/10'}`}>
                    {getIcon(note.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`font-bold ${note.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>{note.title}</h3>
                      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {format(new Date(note.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${note.is_read ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                      {note.message}
                    </p>
                  </div>
                  {!note.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs shrink-0"
                      onClick={() => handleMarkRead(note.id)}
                      disabled={markingId === note.id}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
            <Bell className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">All Caught Up</h3>
            <p className="text-muted-foreground">You have no new notifications.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
