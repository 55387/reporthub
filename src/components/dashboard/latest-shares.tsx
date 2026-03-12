'use client';

import Link from 'next/link';
import { useLocale } from '@/components/providers/locale-provider';
import type { UtteranceInsight } from '@/types';
import { ArrowRight, Calendar, User } from 'lucide-react';

interface LatestSharesProps {
  shares: UtteranceInsight[];
  loading?: boolean;
}

export function LatestShares({ shares, loading }: LatestSharesProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-5 border border-border">
        <div className="skeleton h-5 w-20 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 rounded-lg border border-border">
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-5 border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">
          {t('dashboard.latestShares')}
        </h3>
        <Link
          href="/shares"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {t('dashboard.viewAll')}
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {shares.map((share, index) => (
          <Link
            key={share.id}
            href={`/shares/${share.id}`}
            className="group block p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-all duration-200"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <p className="text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {share.takeaway_summary || share.utterance.slice(0, 100)}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User size={12} />
                {share.speaker}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {new Date(share.share_date).toLocaleDateString('zh-CN')}
              </span>
              {share.topic && (
                <span className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground text-[11px]">
                  {share.topic.length > 15
                    ? share.topic.slice(0, 15) + '...'
                    : share.topic}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
