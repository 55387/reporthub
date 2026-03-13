'use client';

import { useLocale } from '@/components/providers/locale-provider';
import { useTheme } from 'next-themes';
import {
  Globe,
  Moon,
  Sun,
  Monitor,
  UserCircle,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import type { Locale, ThemeMode } from '@/types';
import { useRole } from '@/components/auth/protected-route';
import { useUniAuth } from '@55387.ai/uniauth-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SettingsPage() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useUniAuth();
  const { role } = useRole();

  const themeOptions: { value: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
    { value: 'light', icon: Sun, labelKey: 'settings.light' },
    { value: 'dark', icon: Moon, labelKey: 'settings.dark' },
    { value: 'system', icon: Monitor, labelKey: 'settings.system' },
  ];

  const languageOptions: { value: Locale; label: string }[] = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-foreground md:text-2xl">
        {t('settings.title')}
      </h1>

      {/* Language */}
      <section className="rounded-xl bg-card p-5 border border-border space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--chart-2)]/10">
            <Globe size={18} className="text-[var(--chart-2)]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">
              {t('settings.language')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('settings.languageDesc')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 pl-12">
          {languageOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setLocale(opt.value)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                locale === opt.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-xl bg-card p-5 border border-border space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--chart-3)]/10">
            <Sun size={18} className="text-[var(--chart-3)]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">
              {t('settings.theme')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('settings.themeDesc')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 pl-12">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  theme === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                <Icon size={15} />
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      </section>

      {/* User info */}
      <section className="rounded-xl bg-card p-5 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.avatar_url ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border">
                <Image
                  src={user.avatar_url}
                  alt={user.nickname || 'Avatar'}
                  fill
                  className="object-cover"
                  unoptimized // External URLs might need this
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <UserCircle size={24} className="text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-[16px] font-semibold text-foreground">
                {user?.nickname || t('settings.user')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.phone || user?.email || t('settings.userDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Management (Admin Only) */}
      {role === 'admin' && (
        <section className="rounded-xl bg-card p-5 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ShieldAlert size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-foreground">
                  User Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  View and manage user roles and dashboard permissions.
                </p>
              </div>
            </div>
            <Link
              href="/settings/users"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Manage Users
            </Link>
          </div>
        </section>
      )}

      {/* Logout */}
      <section className="rounded-xl bg-card p-5 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <LogOut size={18} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">
                {t('settings.logout')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('settings.logoutDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="h-9 px-4 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
          >
            {t('settings.logout')}
          </button>
        </div>
      </section>
    </div>
  );
}
