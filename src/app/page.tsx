'use client';

import { useEffect, useState } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import { StatCards } from '@/components/dashboard/stat-cards';
import { TimeTrendChart } from '@/components/dashboard/time-trend-chart';
import { TopicDistributionChart } from '@/components/dashboard/topic-distribution';
import { SpeakerRankingChart } from '@/components/dashboard/speaker-ranking';
import { LatestShares } from '@/components/dashboard/latest-shares';
import type {
  DashboardStats,
  TimeSeriesPoint,
  TopicDistribution,
  SpeakerRanking,
  UtteranceInsight,
} from '@/types';
import { toast } from 'sonner';

interface DashboardData {
  stats: DashboardStats;
  timeSeries: TimeSeriesPoint[];
  topicDistribution: TopicDistribution[];
  speakerRanking: SpeakerRanking[];
  latestShares: UtteranceInsight[];
}

export default function DashboardPage() {
  const { t } = useLocale();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('Failed to fetch');
        const result = await response.json();
        setData(result);
      } catch {
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [t]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-2">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          {t('dashboard.title')}
        </h1>
        {data?.stats.dateRange && (
          <p className="text-sm text-muted-foreground mt-1">
            {data.stats.dateRange.from} — {data.stats.dateRange.to}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <StatCards stats={data?.stats ?? null} loading={loading} />

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TimeTrendChart data={data?.timeSeries ?? []} loading={loading} />
        <TopicDistributionChart
          data={data?.topicDistribution ?? []}
          loading={loading}
        />
      </div>

      {/* Speaker ranking + Latest shares */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpeakerRankingChart
          data={data?.speakerRanking ?? []}
          loading={loading}
        />
        <LatestShares shares={data?.latestShares ?? []} loading={loading} />
      </div>
    </div>
  );
}
