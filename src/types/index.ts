// Database schema types for utterance_insights table

export interface Concept {
  name: string;
  definition: string;
}

export interface KeyTakeaway {
  summary: string;
  content: string;
}

export interface UtteranceInsight {
  id: number;
  speaker: string;
  subject: string;
  topic: string;
  share_date: string; // DATE as ISO string
  utterance: string;
  file_name: string;
  gdrive_id: string;
  right_view: string[];
  concepts: string[]; // stored as TEXT[] in DB, parsed as JSON in app
  insights: string[];
  problems_solved: string[];
  takeaway_summary: string | null;
  takeaway_content: string | null;
  created_at: string;
}

// Query parameters
export interface SharesQueryParams {
  page?: number;
  pageSize?: number;
  speaker?: string;
  topic?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: 'share_date' | 'speaker' | 'topic' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// Pagination
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard stats
export interface DashboardStats {
  totalShares: number;
  totalSpeakers: number;
  totalTopics: number;
  dailyAverage: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface TopicDistribution {
  topic: string;
  count: number;
  percentage: number;
}

export interface SpeakerRanking {
  speaker: string;
  count: number;
}

// P1: Analysis types

export interface WordFrequency {
  word: string;
  count: number;
}

export interface ConceptHeat {
  name: string;
  count: number;
  definition?: string;
}

export interface InsightCluster {
  category: string;
  items: string[];
  count: number;
}

export interface ProblemCategory {
  category: string;
  items: string[];
  count: number;
}

export interface SpeakerProfile {
  speaker: string;
  totalShares: number;
  topTopics: { topic: string; count: number }[];
  topRightViews: string[];
  topConcepts: string[];
  sharesByDate: TimeSeriesPoint[];
  avgInsights: number;
}

export interface TopicDeepAnalysis {
  topic: string;
  totalShares: number;
  speakers: { speaker: string; count: number }[];
  topRightViews: WordFrequency[];
  topConcepts: ConceptHeat[];
  topInsights: string[];
  topProblems: string[];
  sharesByDate: TimeSeriesPoint[];
}

// i18n
export type Locale = 'zh' | 'en';

// Theme
export type ThemeMode = 'light' | 'dark' | 'system';
