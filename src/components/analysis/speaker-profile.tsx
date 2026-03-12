'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { SpeakerProfile } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { User, Hash, BookOpen, Lightbulb, TrendingUp } from 'lucide-react';

interface Props {
  data: SpeakerProfile | null;
  loading: boolean;
}

export function SpeakerProfileCard({ data, loading }: Props) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-6 border border-border">
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="skeleton h-[200px] w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-card p-8 border border-border text-center">
        <User size={32} className="mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {t('analysis.selectSpeaker')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 border border-border space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <User size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{data.speaker}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span>
              {data.totalShares} {t('analysis.totalShares')}
            </span>
            <span>
              {data.avgInsights} {t('analysis.avgInsights')}
            </span>
          </div>
        </div>
      </div>

      {/* Topics */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Hash size={14} className="text-[var(--chart-2)]" />
          <span className="text-sm font-medium">{t('analysis.topTopics')}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.topTopics.map((tp) => (
            <span
              key={tp.topic}
              className="px-2.5 py-1 rounded-full bg-[var(--chart-2)]/10 text-xs text-foreground border border-[var(--chart-2)]/20"
            >
              {tp.topic}{' '}
              <span className="text-muted-foreground">({tp.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Right views */}
      {data.topRightViews.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={14} className="text-[var(--chart-3)]" />
            <span className="text-sm font-medium">
              {t('analysis.topRightViews')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.topRightViews.map((v) => (
              <span
                key={v}
                className="px-2.5 py-1 rounded-full bg-[var(--chart-3)]/10 text-xs text-foreground border border-[var(--chart-3)]/20"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Concepts */}
      {data.topConcepts.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={14} className="text-[var(--chart-5)]" />
            <span className="text-sm font-medium">
              {t('analysis.topConcepts')}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.topConcepts.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-full bg-[var(--chart-5)]/10 text-xs text-foreground border border-[var(--chart-5)]/20"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share trend */}
      {data.sharesByDate.length > 1 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-sm font-medium">
              {t('analysis.sharesTrend')}
            </span>
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sharesByDate}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
