import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getSupabaseServerClient } from './supabase';
import type {
  UtteranceInsight,
  SharesQueryParams,
  PaginatedResult,
  DashboardStats,
  TimeSeriesPoint,
  TopicDistribution,
  SpeakerRanking,
  WordFrequency,
  ConceptHeat,
  InsightCluster,
  ProblemCategory,
  SpeakerProfile,
  TopicDeepAnalysis,
} from '@/types';

const TABLE = 'utterance_insights';

/**
 * Get paginated shares with optional filters
 */
// Base function without caching
async function fetchShares(
  params: SharesQueryParams = {}
): Promise<PaginatedResult<UtteranceInsight>> {
  const {
    page = 1,
    pageSize = 20,
    speaker,
    topic,
    dateFrom,
    dateTo,
    search,
    sortBy = 'share_date',
    sortOrder = 'desc',
  } = params;

  const supabase = getSupabaseServerClient();

  let query = supabase.from(TABLE).select('*', { count: 'exact' }).neq('speaker', 'atai');

  // Apply filters
  if (speaker) {
    query = query.eq('speaker', speaker);
  }
  if (topic) {
    query = query.eq('topic', topic);
  }
  if (dateFrom) {
    query = query.gte('share_date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('share_date', dateTo);
  }
  if (search) {
    query = query.or(
      `utterance.ilike.%${search}%,takeaway_content.ilike.%${search}%,takeaway_summary.ilike.%${search}%`
    );
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch shares: ${error.message}`);
  }

  return {
    data: (data as UtteranceInsight[]) || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// Wrapper to provide application-level caching
export const getShares = cache(async (params: SharesQueryParams = {}) => {
  return unstable_cache(
    async () => fetchShares(params),
    ['shares', JSON.stringify(params)],
    { revalidate: 300, tags: ['shares'] }
  )();
});

/**
 * Get a single share by ID
 */
async function fetchShareById(
  id: number
): Promise<UtteranceInsight | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('speaker', 'atai')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch share: ${error.message}`);
  }

  return data as UtteranceInsight;
}

export const getShareById = cache(async (id: number) => {
  return unstable_cache(
    async () => fetchShareById(id),
    [`share-${id}`],
    { revalidate: 300, tags: ['shares', `share-${id}`] }
  )();
});

/**
 * Get dashboard statistics
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseServerClient();

  // Get total count
  const { count: totalShares } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact' })
    .neq('speaker', 'atai');

  // Get unique speakers
  const { data: speakers } = await supabase
    .from(TABLE)
    .select('speaker')
    .neq('speaker', 'atai')
    .order('speaker');
  const uniqueSpeakers = new Set(speakers?.map((s) => s.speaker));

  // Get unique topics
  const { data: topics } = await supabase
    .from(TABLE)
    .select('topic')
    .neq('speaker', 'atai')
    .order('topic');
  const uniqueTopics = new Set(topics?.map((t) => t.topic));

  // Get date range
  const { data: dateRange } = await supabase
    .from(TABLE)
    .select('share_date')
    .neq('speaker', 'atai')
    .order('share_date', { ascending: true })
    .limit(1);

  const { data: latestDate } = await supabase
    .from(TABLE)
    .select('share_date')
    .neq('speaker', 'atai')
    .order('share_date', { ascending: false })
    .limit(1);

  const from = dateRange?.[0]?.share_date || '';
  const to = latestDate?.[0]?.share_date || '';

  // Calculate daily average
  const total = totalShares || 0;
  let dailyAverage = 0;
  if (from && to) {
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (new Date(to).getTime() - new Date(from).getTime()) /
        (1000 * 60 * 60 * 24)
      ) + 1
    );
    dailyAverage = Math.round((total / daysDiff) * 10) / 10;
  }

  return {
    totalShares: total,
    totalSpeakers: uniqueSpeakers.size,
    totalTopics: uniqueTopics.size,
    dailyAverage,
    dateRange: { from, to },
  };
}

export const getDashboardStats = cache(async () => {
  return unstable_cache(
    async () => fetchDashboardStats(),
    ['dashboard-stats'],
    { revalidate: 300, tags: ['stats'] }
  )();
});

/**
 * Get time series data for shares per day
 */
async function fetchTimeSeries(): Promise<TimeSeriesPoint[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('share_date')
    .neq('speaker', 'atai')
    .order('share_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch time series: ${error.message}`);
  }

  // Group by date
  const dateMap = new Map<string, number>();
  data?.forEach((row) => {
    const date = row.share_date;
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const getTimeSeries = cache(async () => {
  return unstable_cache(
    async () => fetchTimeSeries(),
    ['time-series'],
    { revalidate: 300, tags: ['stats'] }
  )();
});

/**
 * Get topic distribution
 */
async function fetchTopicDistribution(): Promise<TopicDistribution[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.from(TABLE).select('topic').neq('speaker', 'atai');

  if (error) {
    throw new Error(`Failed to fetch topic distribution: ${error.message}`);
  }

  // Group by topic
  const topicMap = new Map<string, number>();
  data?.forEach((row) => {
    const topic = row.topic || 'Unknown';
    topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
  });

  const total = data?.length || 1;

  return Array.from(topicMap.entries())
    .map(([topic, count]) => ({
      topic,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);
}

export const getTopicDistribution = cache(async () => {
  return unstable_cache(
    async () => fetchTopicDistribution(),
    ['topic-distribution'],
    { revalidate: 300, tags: ['stats', 'topics'] }
  )();
});

/**
 * Get speaker ranking (top N)
 */
async function fetchSpeakerRanking(
  limit = 20
): Promise<SpeakerRanking[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.from(TABLE).select('speaker').neq('speaker', 'atai');

  if (error) {
    throw new Error(`Failed to fetch speaker ranking: ${error.message}`);
  }

  const speakerMap = new Map<string, number>();
  data?.forEach((row) => {
    speakerMap.set(row.speaker, (speakerMap.get(row.speaker) || 0) + 1);
  });

  return Array.from(speakerMap.entries())
    .map(([speaker, count]) => ({ speaker, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export const getSpeakerRanking = cache(async (limit = 20) => {
  return unstable_cache(
    async () => fetchSpeakerRanking(limit),
    [`speaker-ranking-${limit}`],
    { revalidate: 300, tags: ['stats', 'speakers'] }
  )();
});

/**
 * Get latest shares (most recent N)
 */
async function fetchLatestShares(
  limit = 10
): Promise<UtteranceInsight[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('speaker', 'atai')
    .order('share_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch latest shares: ${error.message}`);
  }

  return (data as UtteranceInsight[]) || [];
}

export const getLatestShares = cache(async (limit = 10) => {
  return unstable_cache(
    async () => fetchLatestShares(limit),
    [`latest-shares-${limit}`],
    { revalidate: 300, tags: ['shares'] }
  )();
});

/**
 * Get unique speakers list
 */
export const SPEAKER_LIST = [
  { "speaker": "Carrie" },
  { "speaker": "Cheer" },
  { "speaker": "Cheer倩" },
  { "speaker": "Cindy一心" },
  { "speaker": "Dr.杨丽丽" },
  { "speaker": "Lesley" },
  { "speaker": "luna" },
  { "speaker": "Ponyo" },
  { "speaker": "Steven" },
  { "speaker": "Vera" },
  { "speaker": "XuanxuanHong" },
  { "speaker": "Xོ" },
  { "speaker": "一心" },
  { "speaker": "三棵树" },
  { "speaker": "主持人_康雯娟" },
  { "speaker": "乐添" },
  { "speaker": "伟伟" },
  { "speaker": "刘伟伟" },
  { "speaker": "刘伟宣宝科技" },
  { "speaker": "刘小楠" },
  { "speaker": "刘弦" },
  { "speaker": "刘雯伟" },
  { "speaker": "厉瑞男" },
  { "speaker": "吴峰" },
  { "speaker": "周剑雄" },
  { "speaker": "大力" },
  { "speaker": "姜弘钊" },
  { "speaker": "娜娜" },
  { "speaker": "小七" },
  { "speaker": "小楠" },
  { "speaker": "小鹿" },
  { "speaker": "巧贤" },
  { "speaker": "康雯娟" },
  { "speaker": "弘钊" },
  { "speaker": "张敏" },
  { "speaker": "张秉豪" },
  { "speaker": "徐海远" },
  { "speaker": "徐燕" },
  { "speaker": "徐迎娣" },
  { "speaker": "悦薇" },
  { "speaker": "李阳" },
  { "speaker": "杨祖伟" },
  { "speaker": "林娜娜" },
  { "speaker": "林泰君" },
  { "speaker": "林泰泰君" },
  { "speaker": "汪汪" },
  { "speaker": "汪琳映" },
  { "speaker": "狮子" },
  { "speaker": "王乐添" },
  { "speaker": "王斯奕" },
  { "speaker": "王莹娇" },
  { "speaker": "瑞男" },
  { "speaker": "祖伟" },
  { "speaker": "红伟" },
  { "speaker": "胡丫丫" },
  { "speaker": "自在花开" },
  { "speaker": "莹娇" },
  { "speaker": "葛明" },
  { "speaker": "观心" },
  { "speaker": "观摩员 Ponyo" },
  { "speaker": "许宁" },
  { "speaker": "话梅" },
  { "speaker": "话梅冰" },
  { "speaker": "陈伟" },
  { "speaker": "陈琳" },
  { "speaker": "顾倩" },
  { "speaker": "魏素芳" }
];

export async function getSpeakersList(): Promise<string[]> {
  const uniqueSpeakers = [...new Set(SPEAKER_LIST.map((s) => s.speaker))];
  return uniqueSpeakers;
}

/**
 * Get unique topics list
 */
export const TOPIC_LIST = [
  { "topic": "开营仪式" },
  { "topic": "品德成功论" },
  { "topic": "思维方式的力量" },
  { "topic": "以原则为中心的思维方式" },
  { "topic": "成长和改变的原则" },
  { "topic": "品德是习惯的合成" },
  { "topic": "成熟模式图" },
  { "topic": "积极主动的定义" },
  { "topic": "爱是动词" },
  { "topic": "关注圈与影响圈" },
  { "topic": "以终为始" },
  { "topic": "两次创造" },
  { "topic": "改写人生剧本" },
  { "topic": "各种生活中心" },
  { "topic": "别让琐事牵着鼻子走" },
  { "topic": "一对一的人际关系" },
  { "topic": "哪一种最好" },
  { "topic": "双赢品德" },
  { "topic": "移情聆听" },
  { "topic": "和而不同" },
  { "topic": "转型者" },
  { "topic": "日日新生" },
  { "topic": "结营仪式" }
];

/**
 * Get unique topics list (from static config)
 */
export async function getTopicsList(): Promise<string[]> {
  const uniqueTopics = [...new Set(TOPIC_LIST.map((t) => t.topic))];
  return uniqueTopics;
}

// ============ P1: Multi-dimensional Analysis Queries ============

/**
 * Helper: parse concept string to { name, definition }
 */
function parseConcept(raw: string): { name: string; definition: string } {
  try {
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw);
      return { name: parsed.name || raw, definition: parsed.definition || '' };
    }
  } catch {
    // not JSON
  }
  return { name: raw, definition: '' };
}

/**
 * Get right_view word frequency across all shares
 */
async function fetchRightViewFrequency(
  limit = 50
): Promise<WordFrequency[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from(TABLE).select('right_view').neq('speaker', 'atai');

  if (error) throw new Error(`Failed: ${error.message}`);

  const freq = new Map<string, number>();
  data?.forEach((row) => {
    const views: string[] = row.right_view || [];
    views.forEach((v) => {
      const word = v.trim();
      if (word) freq.set(word, (freq.get(word) || 0) + 1);
    });
  });

  return Array.from(freq.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export const getRightViewFrequency = cache(async (limit = 50) => {
  return unstable_cache(
    async () => fetchRightViewFrequency(limit),
    [`right-view-freq-${limit}`],
    { revalidate: 300, tags: ['stats', 'right-views'] }
  )();
});

/**
 * Get concepts heat map data
 */
async function fetchConceptsHeat(limit = 50): Promise<ConceptHeat[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from(TABLE).select('concepts').neq('speaker', 'atai');

  if (error) throw new Error(`Failed: ${error.message}`);

  const conceptMap = new Map<string, { count: number; definition: string }>();
  data?.forEach((row) => {
    const concepts: string[] = row.concepts || [];
    concepts.forEach((c) => {
      const { name, definition } = parseConcept(c);
      const key = name.trim();
      if (!key) return;
      const existing = conceptMap.get(key);
      if (existing) {
        existing.count++;
        if (!existing.definition && definition) existing.definition = definition;
      } else {
        conceptMap.set(key, { count: 1, definition });
      }
    });
  });

  return Array.from(conceptMap.entries())
    .map(([name, { count, definition }]) => ({ name, count, definition }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export const getConceptsHeat = cache(async (limit = 50) => {
  return unstable_cache(
    async () => fetchConceptsHeat(limit),
    [`concepts-heat-${limit}`],
    { revalidate: 300, tags: ['stats', 'concepts'] }
  )();
});

/**
 * Get insights clustered by similarity (simple keyword-based grouping)
 * Groups insights by first significant keyword
 */
async function fetchInsightsClusters(
  limit = 20
): Promise<InsightCluster[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from(TABLE).select('insights').neq('speaker', 'atai');

  if (error) throw new Error(`Failed: ${error.message}`);

  const allInsights: string[] = [];
  data?.forEach((row) => {
    const insights: string[] = row.insights || [];
    insights.forEach((i) => {
      const text = i.trim();
      if (text) allInsights.push(text);
    });
  });

  // Simple categorization: group by first N characters as a proxy for topic
  // In production, this would use NLP / embeddings
  const categories = new Map<string, string[]>();
  allInsights.forEach((insight) => {
    // Extract a category key from the first part of the insight
    const key = insight.slice(0, 10).replace(/[，。！？、：；""''…]/g, '');
    const normalized = key.trim() || 'Other';
    if (categories.has(normalized)) {
      categories.get(normalized)!.push(insight);
    } else {
      categories.set(normalized, [insight]);
    }
  });

  return Array.from(categories.entries())
    .map(([category, items]) => ({ category, items, count: items.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export const getInsightsClusters = cache(async (limit = 20) => {
  return unstable_cache(
    async () => fetchInsightsClusters(limit),
    [`insight-clusters-${limit}`],
    { revalidate: 300, tags: ['stats', 'insights'] }
  )();
});

/**
 * Get problems_solved categorized
 */
async function fetchProblemCategories(
  limit = 20
): Promise<ProblemCategory[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('problems_solved')
    .neq('speaker', 'atai');

  if (error) throw new Error(`Failed: ${error.message}`);

  const allProblems: string[] = [];
  data?.forEach((row) => {
    const problems: string[] = row.problems_solved || [];
    problems.forEach((p) => {
      const text = p.trim();
      if (text) allProblems.push(text);
    });
  });

  // Group by first N characters as a proxy
  const categories = new Map<string, string[]>();
  allProblems.forEach((problem) => {
    const key = problem.slice(0, 10).replace(/[，。！？、：；""''…]/g, '');
    const normalized = key.trim() || 'Other';
    if (categories.has(normalized)) {
      categories.get(normalized)!.push(problem);
    } else {
      categories.set(normalized, [problem]);
    }
  });

  return Array.from(categories.entries())
    .map(([category, items]) => ({ category, items, count: items.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export const getProblemCategories = cache(async (limit = 20) => {
  return unstable_cache(
    async () => fetchProblemCategories(limit),
    [`problem-categories-${limit}`],
    { revalidate: 300, tags: ['stats', 'problems'] }
  )();
});

/**
 * Get detailed speaker profile
 */
async function fetchSpeakerProfile(
  speaker: string
): Promise<SpeakerProfile | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('speaker', 'atai')
    .eq('speaker', speaker);

  if (error) throw new Error(`Failed: ${error.message}`);
  if (!data || data.length === 0) return null;

  // Topics breakdown
  const topicMap = new Map<string, number>();
  const rightViews = new Map<string, number>();
  const conceptsMap = new Map<string, number>();
  const dateMap = new Map<string, number>();
  let totalInsights = 0;

  data.forEach((row) => {
    topicMap.set(row.topic, (topicMap.get(row.topic) || 0) + 1);
    dateMap.set(row.share_date, (dateMap.get(row.share_date) || 0) + 1);

    (row.right_view || []).forEach((v: string) => {
      const word = v.trim();
      if (word) rightViews.set(word, (rightViews.get(word) || 0) + 1);
    });

    (row.concepts || []).forEach((c: string) => {
      const { name } = parseConcept(c);
      if (name) conceptsMap.set(name, (conceptsMap.get(name) || 0) + 1);
    });

    totalInsights += (row.insights || []).length;
  });

  return {
    speaker,
    totalShares: data.length,
    topTopics: Array.from(topicMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count),
    topRightViews: Array.from(rightViews.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word),
    topConcepts: Array.from(conceptsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name),
    sharesByDate: Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    avgInsights: data.length > 0 ? Math.round((totalInsights / data.length) * 10) / 10 : 0,
  };
}

export const getSpeakerProfile = cache(async (speaker: string) => {
  return unstable_cache(
    async () => fetchSpeakerProfile(speaker),
    [`speaker-profile-${speaker}`],
    { revalidate: 300, tags: ['speakers', `speaker-${speaker}`] }
  )();
});

/**
 * Get deep analysis for a specific topic
 */
async function fetchTopicDeepAnalysis(
  topic: string
): Promise<TopicDeepAnalysis | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('speaker', 'atai')
    .eq('topic', topic);

  if (error) throw new Error(`Failed: ${error.message}`);
  if (!data || data.length === 0) return null;

  const speakerMap = new Map<string, number>();
  const rightViews = new Map<string, number>();
  const conceptsMap = new Map<string, { count: number; definition: string }>();
  const dateMap = new Map<string, number>();
  const allInsights: string[] = [];
  const allProblems: string[] = [];

  data.forEach((row) => {
    speakerMap.set(row.speaker, (speakerMap.get(row.speaker) || 0) + 1);
    dateMap.set(row.share_date, (dateMap.get(row.share_date) || 0) + 1);

    (row.right_view || []).forEach((v: string) => {
      const word = v.trim();
      if (word) rightViews.set(word, (rightViews.get(word) || 0) + 1);
    });

    (row.concepts || []).forEach((c: string) => {
      const { name, definition } = parseConcept(c);
      if (!name) return;
      const existing = conceptsMap.get(name);
      if (existing) {
        existing.count++;
        if (!existing.definition && definition) existing.definition = definition;
      } else {
        conceptsMap.set(name, { count: 1, definition });
      }
    });

    (row.insights || []).forEach((i: string) => {
      const text = i.trim();
      if (text) allInsights.push(text);
    });

    (row.problems_solved || []).forEach((p: string) => {
      const text = p.trim();
      if (text) allProblems.push(text);
    });
  });

  return {
    topic,
    totalShares: data.length,
    speakers: Array.from(speakerMap.entries())
      .map(([speaker, count]) => ({ speaker, count }))
      .sort((a, b) => b.count - a.count),
    topRightViews: Array.from(rightViews.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    topConcepts: Array.from(conceptsMap.entries())
      .map(([name, { count, definition }]) => ({ name, count, definition }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    topInsights: allInsights.slice(0, 30),
    topProblems: allProblems.slice(0, 30),
    sharesByDate: Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export const getTopicDeepAnalysis = cache(async (topic: string): Promise<TopicDeepAnalysis | null> => {
  return unstable_cache(
    async () => fetchTopicDeepAnalysis(topic),
    [`topic-analysis-${topic}`],
    { revalidate: 300, tags: ['topics', `topic-${topic}`] }
  )();
});
