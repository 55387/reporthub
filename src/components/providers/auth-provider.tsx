"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { UniAuthProvider, type UniAuthProviderConfig } from "@55387.ai/uniauth-react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch on the client
  }

  // Define UniAuth config using environment variables
  const config: UniAuthProviderConfig = {
    baseUrl: process.env.NEXT_PUBLIC_UNIAUTH_URL || "https://sso.55387.xyz",
    clientId: process.env.NEXT_PUBLIC_UNIAUTH_CLIENT_ID || "",
    sso: {
      ssoUrl: process.env.NEXT_PUBLIC_UNIAUTH_URL || "https://sso.55387.xyz",
      clientId: process.env.NEXT_PUBLIC_UNIAUTH_CLIENT_ID || "", // Required for login() hook
      redirectUri: process.env.NEXT_PUBLIC_UNIAUTH_REDIRECT_URI || (typeof window !== "undefined" ? window.location.origin : ""),
      scope: "openid profile email",
    },
    storage: "localStorage",
  };

  return (
    <UniAuthProvider
      config={config}
      loadingComponent={
        <div className="flex items-center justify-center min-h-[100dvh] bg-page-bg text-text-primary text-sm">
          Loading auth session...
        </div>
      }
    >
      {children}
    </UniAuthProvider>
  );
}
