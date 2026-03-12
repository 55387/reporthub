'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { SpeakerRanking as SpeakerData } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SpeakerRankingProps {
  data: SpeakerData[];
  loading?: boolean;
}

export function SpeakerRankingChart({ data, loading }: SpeakerRankingProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-5 border border-border">
        <div className="skeleton h-5 w-28 mb-4" />
        <div className="skeleton h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  const chartData = data.slice(0, 15).reverse();

  return (
    <div className="rounded-xl bg-card p-5 border border-border animate-fade-in">
      <h3 className="text-base font-semibold text-foreground mb-4">
        {t('dashboard.speakerRanking')}
      </h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="speaker"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--foreground)', fontSize: 13 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--fan-radius-button)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: 13,
              }}
              cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
            />
            <Bar
              dataKey="count"
              fill="var(--chart-1)"
              radius={[0, 6, 6, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
