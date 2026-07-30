import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Filter, ShieldCheck, Mail, Calendar, Trash2 } from '@/lib/icons';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  kycStatus: string | null;
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [debouncedSearch]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : '';
      const data = await apiFetch<UserRow[]>(`/api/admin/users${params}`);
      setUsers(data ?? []);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err?.message ?? 'Failed to load users.' });
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (targetUser: UserRow) => {
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/admin/users/${targetUser.id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
      toast({ title: 'Customer Deleted', description: `${targetUser.firstName} ${targetUser.lastName} has been permanently removed.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: err?.message ?? 'Unable to delete customer.' });
    }
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      await apiFetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
      toast({ title: 'User Updated', description: `User is now ${!currentStatus ? 'active' : 'inactive'}.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user.' });
    }
    setUpdatingId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Customer Management</h1>
            <p className="text-muted-foreground mt-1">Search and manage client profiles.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.length === 0) setDebouncedSearch('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && setDebouncedSearch(search)}
              className="pl-9 bg-background/50"
            />
          </div>
          <Button variant="outline" className="shrink-0" onClick={() => setDebouncedSearch(search)}>
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card key={user.id} className="border-border/50 shadow-sm flex flex-col group overflow-hidden">
                <div className={`h-1.5 w-full ${!user.isActive ? 'bg-destructive' : user.role === 'staff' ? 'bg-accent' : 'bg-primary'}`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link href={`/admin/users/${user.id}`} className="font-bold text-lg hover:text-primary transition-colors inline-block">
                        {user.firstName} {user.lastName}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{user.role}</Badge>
                        {user.kycStatus === 'verified' && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-auto text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleStatus(user.id, user.isActive)}
                        disabled={updatingId === user.id}
                      />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(user)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete customer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center border border-border/50 rounded-xl bg-card">
            <Search className="h-12 w-12 text-muted-foreground opacity-30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Users Found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete Customer
            </DialogTitle>
            <DialogDescription>
              This will permanently delete{' '}
              <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong> and all
              associated accounts, transactions, KYC records, and support tickets.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteTarget && handleDeleteUser(deleteTarget)}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </span>
              ) : 'Yes, Delete Permanently'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
