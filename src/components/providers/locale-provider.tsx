'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Locale } from '@/types';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Record<string, unknown>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Deep get value by dot-separated path
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return key as fallback
    }
  }
  return typeof current === 'string' ? current : path;
}

export function LocaleProvider({
  children,
  initialLocale = 'zh',
  initialMessages,
}: {
  children: ReactNode;
  initialLocale?: Locale;
  initialMessages: Record<string, unknown>;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Record<string, unknown>>(initialMessages);

  const setLocale = useCallback(async (newLocale: Locale) => {
    try {
      const newMessages = await import(`@/i18n/messages/${newLocale}.json`);
      setMessages(newMessages.default);
      setLocaleState(newLocale);
      // Persist preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('reporthub-locale', newLocale);
        document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : 'en';
      }
    } catch {
      console.error(`Failed to load messages for locale: ${newLocale}`);
    }
  }, []);

  const t = useCallback(
    (key: string) => getNestedValue(messages, key),
    [messages]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
