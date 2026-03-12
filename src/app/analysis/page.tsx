'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale } from '@/components/providers/locale-provider';
import { RightViewChart } from '@/components/analysis/right-view-chart';
import { ConceptsHeatMap } from '@/components/analysis/concepts-heat-map';
import { InsightsClustersCard } from '@/components/analysis/insights-clusters';
import { ProblemCategoriesCard } from '@/components/analysis/problem-categories';
import { SpeakerProfileCard } from '@/components/analysis/speaker-profile';
import { TopicDeepCard } from '@/components/analysis/topic-deep-analysis';
import type {
  WordFrequency,
  ConceptHeat,
  InsightCluster,
  ProblemCategory,
  SpeakerProfile,
  TopicDeepAnalysis,
} from '@/types';
import { toast } from 'sonner';
import { BarChart3, User, Hash } from 'lucide-react';

type Tab = 'overview' | 'speaker' | 'topic';

export default function AnalysisPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Overview data
  const [rightViewFreq, setRightViewFreq] = useState<WordFrequency[]>([]);
  const [conceptsHeat, setConceptsHeat] = useState<ConceptHeat[]>([]);
  const [insightsClusters, setInsightsClusters] = useState<InsightCluster[]>([]);
  const [problemCategories, setProblemCategories] = useState<ProblemCategory[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Speaker profile
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [speakerProfile, setSpeakerProfile] = useState<SpeakerProfile | null>(null);
  const [speakerLoading, setSpeakerLoading] = useState(false);

  // Topic deep
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicAnalysis, setTopicAnalysis] = useState<TopicDeepAnalysis | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);

  // Fetch overview data
  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await fetch('/api/analysis?type=overview');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setRightViewFreq(data.rightViewFreq || []);
        setConceptsHeat(data.conceptsHeat || []);
        setInsightsClusters(data.insightsClusters || []);
        setProblemCategories(data.problemCategories || []);
      } catch {
        toast.error(t('common.error'));
      } finally {
        setOverviewLoading(false);
      }
    }
    fetchOverview();
  }, [t]);

  // Fetch filter options
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch('/api/analysis?type=filters');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setSpeakers(data.speakers || []);
        setTopics(data.topics || []);
      } catch {
        console.error('Failed to load filters');
      }
    }
    fetchFilters();
  }, []);

  // Fetch speaker profile
  const fetchSpeakerProfile = useCallback(
    async (speaker: string) => {
      if (!speaker) {
        setSpeakerProfile(null);
        return;
      }
      setSpeakerLoading(true);
      try {
        const res = await fetch(
          `/api/analysis?type=speaker&speaker=${encodeURIComponent(speaker)}`
        );
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setSpeakerProfile(data);
      } catch {
        toast.error(t('common.error'));
      } finally {
        setSpeakerLoading(false);
      }
    },
    [t]
  );

  // Fetch topic deep analysis
  const fetchTopicAnalysis = useCallback(
    async (topic: string) => {
      if (!topic) {
        setTopicAnalysis(null);
        return;
      }
      setTopicLoading(true);
      try {
        const res = await fetch(
          `/api/analysis?type=topic&topic=${encodeURIComponent(topic)}`
        );
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setTopicAnalysis(data);
      } catch {
        toast.error(t('common.error'));
      } finally {
        setTopicLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (selectedSpeaker) fetchSpeakerProfile(selectedSpeaker);
  }, [selectedSpeaker, fetchSpeakerProfile]);

  useEffect(() => {
    if (selectedTopic) fetchTopicAnalysis(selectedTopic);
  }, [selectedTopic, fetchTopicAnalysis]);

  const tabs: { key: Tab; labelKey: string; icon: typeof BarChart3 }[] = [
    { key: 'overview', labelKey: 'analysis.overview', icon: BarChart3 },
    { key: 'speaker', labelKey: 'analysis.speakerProfile', icon: User },
    { key: 'topic', labelKey: 'analysis.topicDeep', icon: Hash },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-foreground md:text-2xl">
        {t('analysis.title')}
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid gap-6 lg:grid-cols-2">
            <RightViewChart data={rightViewFreq} loading={overviewLoading} />
            <ConceptsHeatMap data={conceptsHeat} loading={overviewLoading} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <InsightsClustersCard
              data={insightsClusters}
              loading={overviewLoading}
            />
            <ProblemCategoriesCard
              data={problemCategories}
              loading={overviewLoading}
            />
          </div>
        </div>
      )}

      {/* Speaker profile tab */}
      {activeTab === 'speaker' && (
        <div className="space-y-4 animate-fade-in">
          {/* Speaker selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground shrink-0">
              {t('analysis.selectSpeaker')}
            </label>
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="h-10 max-w-xs rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="">{t('analysis.selectSpeaker')}...</option>
              {speakers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <SpeakerProfileCard
            data={speakerProfile}
            loading={speakerLoading}
          />
        </div>
      )}

      {/* Topic deep analysis tab */}
      {activeTab === 'topic' && (
        <div className="space-y-4 animate-fade-in">
          {/* Topic selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground shrink-0">
              {t('analysis.selectTopic')}
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="h-10 max-w-xs rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="">{t('analysis.selectTopic')}...</option>
              {topics.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>
          <TopicDeepCard data={topicAnalysis} loading={topicLoading} />
        </div>
      )}
    </div>
  );
}
