"use client";

import React, { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { useUniAuth } from "@55387.ai/uniauth-react";
import { Loader2, LogIn, Lock, Clock } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

interface RoleContextType {
  role: string | null;
}

const RoleContext = createContext<RoleContextType>({ role: null });

export const useRole = () => useContext(RoleContext);

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login, logout, user } = useUniAuth();
  const { t } = useLocale();

  const [isSyncing, setIsSyncing] = useState(false);
  const [dbRole, setDbRole] = useState<string | null>(null);

  useEffect(() => {
    // Only sync if they are authenticated and we have user info
    if (isAuthenticated && user && !dbRole && !isSyncing) {
      const syncUser = async () => {
        setIsSyncing(true);
        try {
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uniauth_id: user.id,
              email: user.email,
              nickname: user.nickname,
              avatar_url: user.avatar_url,
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            setDbRole(data.role || 'pending');
          } else {
            setDbRole('pending'); // Fallback to pending to be safe
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
          setDbRole('pending');
        } finally {
          setIsSyncing(false);
        }
      };

      syncUser();
    }
  }, [isAuthenticated, user, dbRole, isSyncing]);

  // If loading session state or syncing roles, show a spinner
  if (isLoading || isSyncing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-page-bg">
        <div className="flex flex-col items-center gap-4 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{isLoading ? (t('Auth.verifying_session') || 'Verifying session...') : 'Syncing permissions...'}</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show a full screen login prompt
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-page-bg">
        <div className="flex flex-col items-center gap-6 rounded-card bg-card p-10 shadow-lg text-center max-w-sm w-full border border-border">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('Auth.welcome_to') || 'Welcome to'} ReportHub
          </h1>
          <p className="text-text-secondary w-full px-4">
            {t('Auth.login_description') || 'Please login to access the Morning Reading Camp dashboard and data analytics.'}
          </p>
          <button
            onClick={() => login({ usePKCE: true })}
            className="flex w-full items-center justify-center gap-2 rounded-8px bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90 mt-4 active:scale-95"
          >
            {t('Auth.login_with_uniauth') || 'Login with UniAuth'}
          </button>
        </div>
      </div>
    );
  }

  // Check Database Role
  if (dbRole === 'pending' || dbRole === 'banned') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-page-bg">
        <div className="flex flex-col items-center gap-6 rounded-card bg-card p-10 shadow-lg text-center max-w-md w-full border border-border">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-warn/10 flex items-center justify-center mb-2">
            {dbRole === 'banned' ? (
              <Lock className="w-8 h-8 text-error" />
            ) : (
              <Clock className="w-8 h-8 text-warn" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {dbRole === 'banned' ? (t('Auth.access_denied') || 'Access Denied') : (t('Auth.pending_approval') || 'Pending Approval')}
          </h1>
          <p className="text-text-secondary w-full px-4 mt-2">
            {dbRole === 'banned' 
              ? (t('Auth.banned_desc') || `Your account has been restricted.`)
              : (t('Auth.pending_desc') || `Welcome back! Your account is currently pending administrator approval. Please ask an admin to grant you access.`)
            }
          </p>
          <div className="flex flex-col w-full gap-3 mt-4">
            <button
              onClick={() => logout()}
              className="flex w-full h-12 items-center justify-center gap-2 rounded-[8px] bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary/90 active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              {t('Auth.switch_account') || 'Switch Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated & Authorized (admin or viewer)
  return (
    <RoleContext.Provider value={{ role: dbRole }}>
      {children}
    </RoleContext.Provider>
  );
}
