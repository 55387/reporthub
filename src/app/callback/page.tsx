"use client";

import { useEffect, useState } from "react";
import { useUniAuth } from "@55387.ai/uniauth-react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export default function CallbackPage() {
  const { isAuthenticated, isLoading } = useUniAuth();
  const router = useRouter();
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If we're mounted, no longer loading auth state, and the user is authenticated,
    // we can redirect them back to the home page or a desired redirect URL.
    // The UniAuthProvider actually handles the token exchange under the hood when it 
    // detects the `code` and `state` parameters in the URL on any page it wraps.
    // This dedicated `/callback` route just ensures Next.js doesn't throw a 404
    // and provides a nice loading screen while the provider finishes the PKCE flow.
    if (mounted && !isLoading) {
      if (isAuthenticated) {
        router.replace("/");
      } else {
        // If it finished loading but isn't authenticated, something might have failed.
        // We can redirect them to the home page where they'll see the login screen again,
        // or the provider will have surfaced an error.
        router.replace("/");
      }
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-page-bg">
      <div className="flex flex-col items-center gap-4 text-text-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>{t('Auth.verifying_session') || 'Verifying session...'}</p>
      </div>
    </div>
  );
}
