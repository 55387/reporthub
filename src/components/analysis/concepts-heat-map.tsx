'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { ConceptHeat } from '@/types';

interface Props {
  data: ConceptHeat[];
  loading: boolean;
}

// Color palette for bubble sizes
const COLORS = [
  'var(--primary)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function ConceptsHeatMap({ data, loading }: Props) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-6 border border-border">
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="skeleton h-[300px] w-full" />
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-xl bg-card p-6 border border-border">
      <div className="mb-1">
        <h3 className="text-base font-semibold text-foreground">
          {t('analysis.conceptsHeat')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('analysis.conceptsHeatDesc')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {data.slice(0, 30).map((concept, i) => {
          const intensity = concept.count / maxCount;
          const size = Math.max(28, Math.round(intensity * 48 + 28));
          const color = COLORS[i % COLORS.length];

          return (
            <div
              key={concept.name}
              className="group relative inline-flex items-center gap-1.5 px-3 rounded-full border transition-all duration-200 hover:shadow-md cursor-default"
              style={{
                height: size,
                borderColor: color,
                backgroundColor: `color-mix(in srgb, ${color} ${Math.round(intensity * 20 + 5)}%, transparent)`,
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color }}
              >
                {concept.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {concept.count}
              </span>

              {/* Tooltip on hover */}
              {concept.definition && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-popover border border-border shadow-lg text-xs text-foreground max-w-[200px] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10">
                  {concept.definition}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
