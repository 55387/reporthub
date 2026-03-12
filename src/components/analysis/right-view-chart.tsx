'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { WordFrequency } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: WordFrequency[];
  loading: boolean;
}

export function RightViewChart({ data, loading }: Props) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-6 border border-border">
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="skeleton h-[300px] w-full" />
      </div>
    );
  }

  const chartData = data.slice(0, 15);

  return (
    <div className="rounded-xl bg-card p-6 border border-border">
      <div className="mb-1">
        <h3 className="text-base font-semibold text-foreground">
          {t('analysis.rightViewFreq')}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('analysis.rightViewFreqDesc')}
        </p>
      </div>
      <div className="h-[360px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              dataKey="word"
              type="category"
              width={120}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: string) =>
                v.length > 12 ? v.slice(0, 12) + '…' : v
              }
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 13,
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--primary)"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
