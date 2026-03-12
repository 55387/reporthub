"use client";

import React, { ReactNode } from "react";
import { useUniAuth } from "@55387.ai/uniauth-react";
import { Loader2, LogIn } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, login } = useUniAuth();
  const { t } = useLocale();

  // If loading session state, show a spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-page-bg">
        <div className="flex flex-col items-center gap-4 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{t('Auth.verifying_session') || 'Verifying session...'}</p>
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

  // Authenticated
  return <>{children}</>;
}
