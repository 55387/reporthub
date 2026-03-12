import { describe, it, expect } from 'vitest';
import type {
  UtteranceInsight,
  DashboardStats,
  PaginatedResult,
  SharesQueryParams,
  TimeSeriesPoint,
  TopicDistribution,
  SpeakerRanking,
} from '@/types';

describe('Type definitions', () => {
  it('should create a valid UtteranceInsight object', () => {
    const insight: UtteranceInsight = {
      id: 1,
      speaker: '张三',
      subject: '第1天',
      topic: '积极主动',
      share_date: '2024-01-01',
      utterance: '今天的分享内容...',
      file_name: 'test.txt',
      gdrive_id: 'abc123',
      right_view: ['观点1', '观点2'],
      concepts: ['概念1'],
      insights: ['心得1'],
      problems_solved: ['问题1'],
      takeaway_summary: '核心要点',
      takeaway_content: '详细内容...',
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(insight.id).toBe(1);
    expect(insight.speaker).toBe('张三');
    expect(insight.right_view).toHaveLength(2);
    expect(insight.takeaway_summary).toBe('核心要点');
  });

  it('should allow null for takeaway fields', () => {
    const insight: UtteranceInsight = {
      id: 2,
      speaker: '李四',
      subject: '',
      topic: '以终为始',
      share_date: '2024-01-02',
      utterance: '分享内容',
      file_name: 'test2.txt',
      gdrive_id: 'def456',
      right_view: [],
      concepts: [],
      insights: [],
      problems_solved: [],
      takeaway_summary: null,
      takeaway_content: null,
      created_at: '2024-01-02T00:00:00Z',
    };

    expect(insight.takeaway_summary).toBeNull();
    expect(insight.takeaway_content).toBeNull();
  });

  it('should create valid DashboardStats', () => {
    const stats: DashboardStats = {
      totalShares: 2000,
      totalSpeakers: 50,
      totalTopics: 21,
      dailyAverage: 95.2,
      dateRange: {
        from: '2024-01-01',
        to: '2024-01-21',
      },
    };

    expect(stats.totalShares).toBe(2000);
    expect(stats.dailyAverage).toBeCloseTo(95.2);
    expect(stats.dateRange.from).toBe('2024-01-01');
  });

  it('should create valid PaginatedResult', () => {
    const result: PaginatedResult<UtteranceInsight> = {
      data: [],
      total: 100,
      page: 1,
      pageSize: 20,
      totalPages: 5,
    };

    expect(result.totalPages).toBe(5);
    expect(result.data).toHaveLength(0);
  });

  it('should handle SharesQueryParams defaults', () => {
    const params: SharesQueryParams = {};

    expect(params.page).toBeUndefined();
    expect(params.search).toBeUndefined();
    expect(params.sortBy).toBeUndefined();
  });

  it('should create valid chart data types', () => {
    const timeSeries: TimeSeriesPoint[] = [
      { date: '2024-01-01', count: 10 },
      { date: '2024-01-02', count: 15 },
    ];

    const topicDist: TopicDistribution[] = [
      { topic: '积极主动', count: 100, percentage: 50 },
    ];

    const speakerRank: SpeakerRanking[] = [
      { speaker: '张三', count: 20 },
    ];

    expect(timeSeries).toHaveLength(2);
    expect(topicDist[0].percentage).toBe(50);
    expect(speakerRank[0].speaker).toBe('张三');
  });
});
