'use client';

import { useLocale } from '@/components/providers/locale-provider';
import type { TopicDistribution as TopicData } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TopicDistributionProps {
  data: TopicData[];
  loading?: boolean;
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#06B6D4',
  '#84CC16',
];

export function TopicDistributionChart({
  data,
  loading,
}: TopicDistributionProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="rounded-xl bg-card p-5 border border-border">
        <div className="skeleton h-5 w-20 mb-4" />
        <div className="skeleton h-[280px] w-full rounded-lg" />
      </div>
    );
  }

  // Truncate long topic names
  const chartData = data.slice(0, 10).map((item) => ({
    ...item,
    shortTopic:
      item.topic.length > 12 ? item.topic.slice(0, 12) + '...' : item.topic,
  }));

  return (
    <div className="rounded-xl bg-card p-5 border border-border animate-fade-in">
      <h3 className="text-base font-semibold text-foreground mb-4">
        {t('dashboard.topicDistribution')}
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="count"
              nameKey="shortTopic"
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-opacity duration-200 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--fan-radius-button)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: 13,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `${value} (${data.find((d) => d.topic.startsWith(String(name).replace('...', '')))?.percentage || 0}%)`,
                name,
              ]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: 12, lineHeight: '24px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
