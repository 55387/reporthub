'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from '@/components/providers/locale-provider';
import type { UtteranceInsight, PaginatedResult } from '@/types';
import {
  Search,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SharesPage() {
  const { t } = useLocale();
  const [data, setData] = useState<PaginatedResult<UtteranceInsight> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch filter options
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch('/api/shares?type=filters');
        if (!res.ok) throw new Error('Failed to fetch filters');
        const result = await res.json();
        setSpeakers(result.speakers || []);
        setTopics(result.topics || []);
      } catch {
        console.error('Failed to load filters');
      }
    }
    fetchFilters();
  }, []);

  // Fetch shares
  const fetchShares = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '20');
      if (search) params.set('search', search);
      if (selectedSpeaker) params.set('speaker', selectedSpeaker);
      if (selectedTopic) params.set('topic', selectedTopic);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/shares?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const result = await res.json();
      setData(result);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedSpeaker, selectedTopic, dateFrom, dateTo, t]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, selectedSpeaker, selectedTopic, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch('');
    setSelectedSpeaker('');
    setSelectedTopic('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters =
    search || selectedSpeaker || selectedTopic || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          {t('shares.title')}
        </h1>
      </div>

      {/* Search & filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('shares.search')}
              className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg border text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? 'border-primary bg-accent text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">
              {t('shares.filterSpeaker').split(' ')[0]}
            </span>
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-4 rounded-lg bg-card border border-border animate-fade-in">
            {/* Speaker */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('shares.filterSpeaker')}
              </label>
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">{t('shares.allSpeakers')}</option>
                {speakers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('shares.filterTopic')}
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">{t('shares.allTopics')}</option>
                {topics.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('shares.dateFrom')}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t('shares.dateTo')}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}

        {/* Active filter indicator */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <X size={14} />
            {t('shares.clearFilters')}
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-card p-4 border border-border"
            >
              <div className="skeleton h-4 w-3/4 mb-3" />
              <div className="skeleton h-3 w-full mb-2" />
              <div className="flex gap-4">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          {/* Share list */}
          <div className="space-y-3">
            {data.data.map((share) => (
              <Link
                key={share.id}
                href={`/shares/${share.id}`}
                className="group block rounded-xl bg-card p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                {/* Title / Summary */}
                <h3 className="text-[15px] font-medium text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {share.takeaway_summary || share.utterance.slice(0, 80)}
                </h3>

                {/* Content preview */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {share.utterance.slice(0, 200)}
                </p>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {share.speaker}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(share.share_date).toLocaleDateString('zh-CN')}
                  </span>
                  {share.topic && (
                    <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[11px]">
                      {share.topic}
                    </span>
                  )}
                  {share.right_view && share.right_view.length > 0 && (
                    <span className="text-muted-foreground">
                      {share.right_view.length} {t('shares.rightView')}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">
              {t('shares.showing')} {(data.page - 1) * data.pageSize + 1}{' '}
              {t('shares.to')}{' '}
              {Math.min(data.page * data.pageSize, data.total)}{' '}
              {t('shares.total')} {data.total} {t('shares.records')}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 h-8 px-3 rounded-md border border-border bg-card text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                {t('shares.previous')}
              </button>
              <span className="flex items-center text-sm text-muted-foreground px-2">
                {data.page} / {data.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages, p + 1))
                }
                disabled={page >= data.totalPages}
                className="flex items-center gap-1 h-8 px-3 rounded-md border border-border bg-card text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('shares.next')}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl bg-card p-12 border border-border text-center">
          <p className="text-muted-foreground">{t('shares.noResults')}</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-sm text-primary hover:underline"
            >
              {t('shares.clearFilters')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
