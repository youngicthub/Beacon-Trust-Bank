import { useEffect, useState, useCallback } from 'react';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'customer' | 'staff' | 'admin';
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
};

const TOKEN_KEY = 'beacon_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event('storage'));
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event('storage'));
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(undefined);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        clearToken();
        setUser(undefined);
      } else {
        const u: AuthUser = await res.json();
        setUser(u);
      }
    } catch {
      setUser(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const handler = () => loadUser();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [loadUser]);

  return {
    user,
    isLoading,
    isError: false,
    error: undefined,
    isAuthenticated: !!user,
  };
}

export async function signOut(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
  }
  clearToken();
}
