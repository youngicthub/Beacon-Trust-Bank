import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
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
  isRead: boolean;
  createdAt: string;
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
    try {
      const data = await apiFetch<NotifRow[]>('/api/notifications');
      setNotifications(data ?? []);
    } catch {
      // silent — empty list on error
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
    setMarkingId(null);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setMarkingAll(true);
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to mark all as read.' });
    }
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
                className={`p-4 border-border/50 transition-all ${note.isRead ? 'bg-background opacity-70' : 'bg-card border-l-4 border-l-primary shadow-sm'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-full ${note.isRead ? 'bg-muted' : 'bg-primary/10'}`}>
                    {getIcon(note.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`font-bold ${note.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>{note.title}</h3>
                      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {format(new Date(note.createdAt), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${note.isRead ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                      {note.message}
                    </p>
                  </div>
                  {!note.isRead && (
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
