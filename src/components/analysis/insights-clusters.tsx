'use client';

import { useState } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import type { InsightCluster } from '@/types';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

interface Props {
  data: InsightCluster[];
  loading: boolean;
}

export function InsightsClustersCard({ data, loading }: Props) {
  const { t } = useLocale();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-6 border border-border">
        <div className="skeleton h-5 w-40 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 w-full mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 border border-border">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          {t('analysis.insightsClusters')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('analysis.insightsClustersDesc')}
        </p>
      </div>
      <div className="space-y-2">
        {data.slice(0, 12).map((cluster, index) => {
          const isExpanded = expandedIdx === index;
          return (
            <div
              key={cluster.category}
              className="rounded-lg border border-border overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() =>
                  setExpandedIdx(isExpanded ? null : index)
                }
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Lightbulb
                    size={16}
                    className="shrink-0 text-[var(--chart-3)]"
                  />
                  <span className="text-sm font-medium text-foreground truncate">
                    {cluster.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {cluster.count} {t('analysis.items')}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 space-y-1.5 animate-fade-in">
                  {cluster.items.slice(0, 8).map((item, i) => (
                    <p
                      key={i}
                      className="text-xs text-muted-foreground pl-6 border-l-2 border-[var(--chart-3)]/30"
                    >
                      {item}
                    </p>
                  ))}
                  {cluster.items.length > 8 && (
                    <p className="text-xs text-muted-foreground/60 pl-6">
                      +{cluster.items.length - 8} more...
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
