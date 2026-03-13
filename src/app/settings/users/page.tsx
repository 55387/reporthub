'use client';

import { useEffect, useState } from 'react';
import { useUniAuth } from '@55387.ai/uniauth-react';
import { useLocale } from '@/components/providers/locale-provider';
import { useRole } from '@/components/auth/protected-route';
import { Loader2, ShieldAlert, UserCog, UserCircle } from 'lucide-react';
import { ReportHubUser } from '@/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function UsersManagementPage() {
  const { user } = useUniAuth();
  const { t } = useLocale();
  const { role } = useRole();
  const [users, setUsers] = useState<ReportHubUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users?callerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error('Failed to load users');
      }
    } catch (e) {
      toast.error('Network error while loading users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [role, user]);

  const handleRoleChange = async (targetId: string, newRole: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId: user.id, targetId, newRole }),
      });
      if (res.ok) {
        toast.success('Role updated successfully');
        setUsers((prev) => 
          prev.map((u) => (u.uniauth_id === targetId ? { ...u, role: newRole as any } : u))
        );
      } else {
        toast.error('Failed to update role');
      }
    } catch(e) {
      toast.error('Network error');
    }
  };

  if (role !== 'admin') {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="h-16 w-16 text-error mb-4 opacity-30" />
        <h2 className="text-xl font-semibold mb-2 text-foreground">Admin Access Required</h2>
        <p className="text-muted-foreground max-w-sm">
          You do not have permission to view the User Management console.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <UserCog size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage dashboard access and user roles.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.uniauth_id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border shrink-0">
                          <Image src={u.avatar_url} alt={u.nickname} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <UserCircle className="h-8 w-8 text-muted-foreground shrink-0" />
                      )}
                      <span className="font-medium text-foreground">{u.nickname || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uniauth_id, e.target.value)}
                      disabled={u.uniauth_id === user?.id}
                      className={`text-xs px-2 py-1 rounded-md border text-foreground bg-transparent font-medium ${
                        u.role === 'admin' ? 'border-primary/50 text-primary bg-primary/5' :
                        u.role === 'pending' ? 'border-warn/50 text-warn bg-warn/5' :
                        'border-border'
                      }`}
                    >
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                      <option value="pending">Pending</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {u.last_login_at ? format(new Date(u.last_login_at), 'PP p') : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
