'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { TopicDeepAnalysis } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Hash,
  Users,
  Lightbulb,
  BookOpen,
  Target,
  TrendingUp,
} from 'lucide-react';

interface Props {
  data: TopicDeepAnalysis | null;
  loading: boolean;
}

export function TopicDeepCard({ data, loading }: Props) {
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
        <Hash size={32} className="mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {t('analysis.selectTopic')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 border border-border space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--chart-2)]/10">
          <Hash size={24} className="text-[var(--chart-2)]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{data.topic}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span>
              {data.totalShares} {t('analysis.totalShares')}
            </span>
            <span>
              {data.speakers.length} {t('analysis.participants')}
            </span>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Users size={14} className="text-primary" />
          <span className="text-sm font-medium">
            {t('analysis.participants')} ({data.speakers.length})
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.speakers.slice(0, 15).map((s) => (
            <span
              key={s.speaker}
              className="px-2.5 py-1 rounded-full bg-primary/10 text-xs text-foreground border border-primary/20"
            >
              {s.speaker}{' '}
              <span className="text-muted-foreground">({s.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Right views bar chart */}
      {data.topRightViews.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={14} className="text-[var(--chart-3)]" />
            <span className="text-sm font-medium">
              {t('analysis.topRightViews')}
            </span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topRightViews.slice(0, 10)}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="word"
                  type="category"
                  width={100}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) =>
                    v.length > 10 ? v.slice(0, 10) + '…' : v
                  }
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
                  fill="var(--chart-3)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
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
            {data.topConcepts.slice(0, 15).map((c) => (
              <span
                key={c.name}
                className="px-2.5 py-1 rounded-full bg-[var(--chart-5)]/10 text-xs text-foreground border border-[var(--chart-5)]/20"
              >
                {c.name}{' '}
                <span className="text-muted-foreground">({c.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {data.topInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={14} className="text-[var(--chart-3)]" />
            <span className="text-sm font-medium">
              {t('analysis.topInsights')} ({data.topInsights.length})
            </span>
          </div>
          <ul className="space-y-1">
            {data.topInsights.slice(0, 6).map((insight, i) => (
              <li
                key={i}
                className="text-xs text-muted-foreground pl-4 border-l-2 border-[var(--chart-3)]/20"
              >
                {insight.length > 100 ? insight.slice(0, 100) + '…' : insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Problems */}
      {data.topProblems.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={14} className="text-[var(--chart-4)]" />
            <span className="text-sm font-medium">
              {t('analysis.topProblems')} ({data.topProblems.length})
            </span>
          </div>
          <ul className="space-y-1">
            {data.topProblems.slice(0, 6).map((problem, i) => (
              <li
                key={i}
                className="text-xs text-muted-foreground pl-4 border-l-2 border-[var(--chart-4)]/20"
              >
                {problem.length > 100
                  ? problem.slice(0, 100) + '…'
                  : problem}
              </li>
            ))}
          </ul>
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
          <div className="h-[140px]">
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
                  fill="var(--chart-2)"
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
