'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from '@/components/providers/locale-provider';
import type { UtteranceInsight } from '@/types';
import {
  ArrowLeft,
  User,
  Calendar,
  Hash,
  Lightbulb,
  BookOpen,
  Target,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShareDetailPage() {
  const params = useParams();
  const { t } = useLocale();
  const [share, setShare] = useState<UtteranceInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`/api/shares?id=${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setShare(data);
      } catch {
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchShare();
  }, [params.id, t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-6 w-32" />
        <div className="rounded-xl bg-card p-6 border border-border">
          <div className="skeleton h-6 w-3/4 mb-4" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!share) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t('common.noData')}</p>
        <Link
          href="/shares"
          className="mt-4 inline-flex items-center gap-1 text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          {t('shares.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back nav */}
      <Link
        href="/shares"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        {t('shares.back')}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground md:text-2xl mb-3">
          {share.takeaway_summary || t('shares.detail')}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User size={15} />
            {share.speaker}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={15} />
            {new Date(share.share_date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {share.topic && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs">
              <Hash size={12} />
              {share.topic}
            </span>
          )}
        </div>
      </div>

      {/* Original text */}
      <section className="rounded-xl bg-card p-6 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-primary" />
          <h2 className="text-base font-semibold">{t('shares.originalText')}</h2>
        </div>
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {share.utterance}
        </div>
      </section>

      {/* Right views */}
      {share.right_view && share.right_view.length > 0 && (
        <section className="rounded-xl bg-card p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-[var(--chart-3)]" />
            <h2 className="text-base font-semibold">{t('shares.rightView')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {share.right_view.map((view, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-[var(--chart-3)]/10 text-sm text-foreground border border-[var(--chart-3)]/20"
              >
                {view}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Concepts */}
      {share.concepts && share.concepts.length > 0 && (
        <section className="rounded-xl bg-card p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-[var(--chart-2)]" />
            <h2 className="text-base font-semibold">{t('shares.concepts')}</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {share.concepts.map((concept, i) => {
              // Try to parse concept as JSON {name, definition}
              let parsed: { name: string; definition: string } | null = null;
              try {
                if (concept.startsWith('{')) {
                  parsed = JSON.parse(concept);
                }
              } catch {
                // not JSON, use raw text
              }

              return (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-[var(--chart-2)]/5 border border-[var(--chart-2)]/15"
                >
                  {parsed ? (
                    <>
                      <span className="font-medium text-sm text-foreground">
                        {parsed.name}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {parsed.definition}
                      </p>
                    </>
                  ) : (
                    <span className="text-sm text-foreground">{concept}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Insights */}
      {share.insights && share.insights.length > 0 && (
        <section className="rounded-xl bg-card p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-[var(--chart-5)]" />
            <h2 className="text-base font-semibold">{t('shares.insights')}</h2>
          </div>
          <ul className="space-y-2">
            {share.insights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-[var(--chart-5)]" />
                {insight}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Problems solved */}
      {share.problems_solved && share.problems_solved.length > 0 && (
        <section className="rounded-xl bg-card p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-[var(--chart-4)]" />
            <h2 className="text-base font-semibold">
              {t('shares.problemsSolved')}
            </h2>
          </div>
          <ul className="space-y-2">
            {share.problems_solved.map((problem, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-[var(--chart-4)]" />
                {problem}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Key takeaway */}
      {share.takeaway_content && (
        <section className="rounded-xl bg-card p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-primary" />
            <h2 className="text-base font-semibold">{t('shares.takeaway')}</h2>
          </div>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
            {share.takeaway_content}
          </div>
        </section>
      )}
    </div>
  );
}
