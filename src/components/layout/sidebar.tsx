'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/components/providers/locale-provider';
import {
  LayoutDashboard,
  MessageSquareText,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  UserCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useUniAuth } from '@55387.ai/uniauth-react';

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { key: 'dashboard', href: '/', icon: LayoutDashboard },
  { key: 'shares', href: '/shares', icon: MessageSquareText },
  { key: 'analysis', href: '/analysis', icon: BarChart3 },
  { key: 'ai', href: '/ai', icon: Sparkles },
  { key: 'settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLocale();
  const { user } = useUniAuth();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-[var(--header-height)] items-center gap-3 px-4 border-b border-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen size={20} />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-[15px] font-semibold text-foreground leading-tight">
              ReportHub
            </h1>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {t('app.description')}
            </p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                transition-all duration-200 relative
                ${
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
              title={collapsed ? t(`nav.${item.key}`) : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
              <Icon size={20} className={active ? 'text-primary' : ''} />
              {!collapsed && (
                <span className="animate-fade-in">{t(`nav.${item.key}`)}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-3">
        {/* User Profile */}
        <Link href="/settings" className={`flex items-center gap-3 rounded-lg hover:bg-muted p-2 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          {user?.avatar_url ? (
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border">
              <Image
                src={user.avatar_url}
                alt={user.nickname || 'User'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserCircle size={18} className="text-primary" />
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.nickname || t('settings.user')}
              </p>
            </div>
          )}
        </Link>
        
        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>{t('common.close')}</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border shadow-md md:hidden"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span
              className={`block h-0.5 w-5 bg-foreground transition-transform duration-200 ${
                mobileOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground transition-opacity duration-200 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-5 bg-foreground transition-transform duration-200 ${
                mobileOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </div>
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-card border-r border-border
          transition-all duration-300 ease-in-out
          ${isMobile
            ? mobileOpen
              ? 'translate-x-0 w-[var(--sidebar-width)]'
              : '-translate-x-full w-[var(--sidebar-width)]'
            : collapsed
              ? 'w-[var(--sidebar-collapsed-width)]'
              : 'w-[var(--sidebar-width)]'
          }
        `}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for main content */}
      {!isMobile && (
        <div
          className="shrink-0 transition-all duration-300"
          style={{
            width: collapsed
              ? 'var(--sidebar-collapsed-width)'
              : 'var(--sidebar-width)',
          }}
        />
      )}
    </>
  );
}
