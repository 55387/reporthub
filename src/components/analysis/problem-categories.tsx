'use client';

import { useState } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import type { ProblemCategory } from '@/types';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';

interface Props {
  data: ProblemCategory[];
  loading: boolean;
}

export function ProblemCategoriesCard({ data, loading }: Props) {
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

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl bg-card p-6 border border-border">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          {t('analysis.problemCategories')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('analysis.problemCategoriesDesc')}
        </p>
      </div>
      <div className="space-y-2">
        {data.slice(0, 12).map((category, index) => {
          const isExpanded = expandedIdx === index;
          const barWidth = Math.max(8, (category.count / maxCount) * 100);

          return (
            <div
              key={category.category}
              className="rounded-lg border border-border overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() =>
                  setExpandedIdx(isExpanded ? null : index)
                }
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Target
                      size={16}
                      className="shrink-0 text-[var(--chart-4)]"
                    />
                    <span className="text-sm font-medium text-foreground truncate">
                      {category.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {category.count} {t('analysis.items')}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-muted-foreground" />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-muted-foreground"
                      />
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden ml-6">
                  <div
                    className="h-full rounded-full bg-[var(--chart-4)] transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 space-y-1.5 animate-fade-in">
                  {category.items.slice(0, 8).map((item, i) => (
                    <p
                      key={i}
                      className="text-xs text-muted-foreground pl-6 border-l-2 border-[var(--chart-4)]/30"
                    >
                      {item}
                    </p>
                  ))}
                  {category.items.length > 8 && (
                    <p className="text-xs text-muted-foreground/60 pl-6">
                      +{category.items.length - 8} more...
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
