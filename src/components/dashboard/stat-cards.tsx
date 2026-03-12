'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { DashboardStats } from '@/types';
import { MessageSquareText, Users, Hash, TrendingUp } from 'lucide-react';

interface StatCardsProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

const statConfig = [
  {
    key: 'totalShares' as const,
    icon: MessageSquareText,
    color: 'text-[var(--chart-1)]',
    bgColor: 'bg-[var(--chart-1)]/10',
    unitKey: 'dashboard.shares',
  },
  {
    key: 'totalSpeakers' as const,
    icon: Users,
    color: 'text-[var(--chart-2)]',
    bgColor: 'bg-[var(--chart-2)]/10',
    unitKey: 'dashboard.people',
  },
  {
    key: 'totalTopics' as const,
    icon: Hash,
    color: 'text-[var(--chart-3)]',
    bgColor: 'bg-[var(--chart-3)]/10',
    unitKey: 'dashboard.topics',
  },
  {
    key: 'dailyAverage' as const,
    icon: TrendingUp,
    color: 'text-[var(--chart-5)]',
    bgColor: 'bg-[var(--chart-5)]/10',
    unitKey: 'dashboard.perDay',
  },
];

export function StatCards({ stats, loading }: StatCardsProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="stat-card rounded-xl bg-card p-5 border border-border"
          >
            <div className="skeleton h-4 w-20 mb-3" />
            <div className="skeleton h-8 w-16 mb-1" />
            <div className="skeleton h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 stagger-children">
      {statConfig.map((item) => {
        const Icon = item.icon;
        const value = stats?.[item.key] ?? 0;

        return (
          <div
            key={item.key}
            className="stat-card group rounded-xl bg-card p-5 border border-border hover:shadow-lg transition-all duration-300 cursor-default"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">
                {t(`dashboard.${item.key}`)}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bgColor} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={18} className={item.color} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              <span className="text-sm text-muted-foreground">
                {t(item.unitKey)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
