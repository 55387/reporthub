import { NextResponse } from 'next/server';
import {
  getDashboardStats,
  getTimeSeries,
  getTopicDistribution,
  getSpeakerRanking,
  getLatestShares,
} from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [stats, timeSeries, topicDistribution, speakerRanking, latestShares] =
      await Promise.all([
        getDashboardStats(),
        getTimeSeries(),
        getTopicDistribution(),
        getSpeakerRanking(20),
        getLatestShares(10),
      ]);

    return NextResponse.json({
      stats,
      timeSeries,
      topicDistribution,
      speakerRanking,
      latestShares,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
