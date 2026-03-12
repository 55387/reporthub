'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { TimeSeriesPoint } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TimeTrendChartProps {
  data: TimeSeriesPoint[];
  loading?: boolean;
}

export function TimeTrendChart({ data, loading }: TimeTrendChartProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-5 border border-border">
        <div className="skeleton h-5 w-24 mb-4" />
        <div className="skeleton h-[280px] w-full rounded-lg" />
      </div>
    );
  }

  // Format date labels
  const chartData = data.map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="rounded-xl bg-card p-5 border border-border animate-fade-in">
      <h3 className="text-base font-semibold text-foreground mb-4">
        {t('dashboard.timeTrend')}
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dx={-8}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--fan-radius-button)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: 13,
              }}
              itemStyle={{ color: 'var(--foreground)' }}
              labelStyle={{ color: 'var(--muted-foreground)', marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#colorCount)"
              dot={false}
              activeDot={{
                r: 5,
                fill: 'var(--chart-1)',
                stroke: 'var(--card)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
