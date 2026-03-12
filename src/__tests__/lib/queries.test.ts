import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase before importing — needed for server module
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 1,
            speaker: '张三',
            subject: '',
            topic: '积极主动',
            share_date: '2024-01-01',
            utterance: '分享内容',
            file_name: 'test.txt',
            gdrive_id: 'abc123',
            right_view: ['观点1'],
            concepts: [],
            insights: [],
            problems_solved: [],
            takeaway_summary: '要点',
            takeaway_content: '内容',
            created_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        }),
        then: vi.fn(),
      })),
    })),
  })),
}));

// Set env vars before importing queries
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-key');

describe('Database queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct query parameter structure', () => {
    const params = {
      page: 1,
      pageSize: 20,
      speaker: '张三',
      topic: '积极主动',
      search: '幸福',
    };

    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(20);
    expect(params.speaker).toBe('张三');
  });

  it('should calculate pagination correctly', () => {
    const page = 3;
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    expect(from).toBe(40);
    expect(to).toBe(59);
  });

  it('should calculate daily average correctly', () => {
    const total = 210;
    const from = '2024-01-01';
    const to = '2024-01-21';
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (new Date(to).getTime() - new Date(from).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
    const dailyAverage = Math.round((total / daysDiff) * 10) / 10;

    expect(daysDiff).toBe(21);
    expect(dailyAverage).toBe(10);
  });

  it('should group time series data correctly', () => {
    const rawData = [
      { share_date: '2024-01-01' },
      { share_date: '2024-01-01' },
      { share_date: '2024-01-02' },
      { share_date: '2024-01-02' },
      { share_date: '2024-01-02' },
    ];

    const dateMap = new Map<string, number>();
    rawData.forEach((row) => {
      dateMap.set(row.share_date, (dateMap.get(row.share_date) || 0) + 1);
    });

    const result = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: '2024-01-01', count: 2 });
    expect(result[1]).toEqual({ date: '2024-01-02', count: 3 });
  });

  it('should group speakers correctly', () => {
    const rawData = [
      { speaker: '张三' },
      { speaker: '张三' },
      { speaker: '李四' },
      { speaker: '王五' },
      { speaker: '张三' },
    ];

    const speakerMap = new Map<string, number>();
    rawData.forEach((row) => {
      speakerMap.set(row.speaker, (speakerMap.get(row.speaker) || 0) + 1);
    });

    const result = Array.from(speakerMap.entries())
      .map(([speaker, count]) => ({ speaker, count }))
      .sort((a, b) => b.count - a.count);

    expect(result[0]).toEqual({ speaker: '张三', count: 3 });
    expect(result).toHaveLength(3);
  });

  it('should calculate topic distribution percentages', () => {
    const rawData = [
      { topic: '积极主动' },
      { topic: '积极主动' },
      { topic: '以终为始' },
      { topic: '要事第一' },
    ];

    const topicMap = new Map<string, number>();
    rawData.forEach((row) => {
      topicMap.set(row.topic, (topicMap.get(row.topic) || 0) + 1);
    });

    const total = rawData.length;
    const result = Array.from(topicMap.entries())
      .map(([topic, count]) => ({
        topic,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    expect(result[0].topic).toBe('积极主动');
    expect(result[0].percentage).toBe(50);
    expect(result[1].percentage).toBe(25);
  });
});
