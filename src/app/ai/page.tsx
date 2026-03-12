'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useLocale } from '@/components/providers/locale-provider';
import { AiMessage } from '@/components/ai/ai-message';
import { SUGGESTED_PROMPTS } from '@/lib/ai';
import {
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  Star,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';

const transport = new DefaultChatTransport({ api: '/api/ai/chat' });

export default function AiPage() {
  const { t, locale } = useLocale();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const {
    messages,
    sendMessage,
    status,
    error,
    setMessages,
  } = useChat({
    transport,
    onError: (err) => {
      toast.error(err.message || t('ai.error'));
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSend = () => {
    if (!input.trim() || status !== 'ready') return;
    sendMessage(
      { text: input },
      { body: { context: 'AI 智能问答页 (全屏模式)' } }
    );
    setInput('');
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(
      { text: prompt },
      { body: { context: 'AI 智能问答页 (全屏模式)' } }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSend();
  };

  const suggestedPrompts =
    locale === 'zh' ? SUGGESTED_PROMPTS.zh : SUGGESTED_PROMPTS.en;

  const categories = [
    {
      key: 'trending',
      label: t('ai.trending'),
      icon: TrendingUp,
      prompts: suggestedPrompts.slice(0, 2),
    },
    {
      key: 'highlights',
      label: t('ai.highlights'),
      icon: Star,
      prompts: suggestedPrompts.slice(2, 4),
    },
    {
      key: 'crossAnalysis',
      label: t('ai.crossAnalysis'),
      icon: GitBranch,
      prompts: suggestedPrompts.slice(4, 6),
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            {t('ai.pageTitle')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('ai.pageDesc')}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Trash2 size={14} />
            {t('ai.clearChat')}
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
              <Sparkles size={36} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              {t('ai.welcome')}
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              {t('ai.welcomeDesc')}
            </p>

            {/* Category tabs */}
            <div className="w-full max-w-2xl">
              <div className="flex justify-center gap-2 mb-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.key}
                      onClick={() =>
                        setActiveCategory(
                          activeCategory === cat.key ? null : cat.key
                        )
                      }
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        activeCategory === cat.key
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon size={14} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {(activeCategory
                  ? categories.find((c) => c.key === activeCategory)?.prompts
                  : suggestedPrompts
                )?.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="text-left px-4 py-3 rounded-xl border border-border text-sm text-foreground hover:bg-muted/50 hover:border-primary/30 transition-all duration-200"
                  >
                    <span className="text-primary mr-2">✦</span>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const content = msg.parts
              ?.filter((p) => p.type === 'text')
              .map((p) => (p as { type: 'text'; text: string }).text)
              .join('') || '';
            return (
              <AiMessage
                key={msg.id}
                role={msg.role as 'user' | 'assistant'}
                content={content}
                isStreaming={
                  status === 'streaming' &&
                  msg.id === messages[messages.length - 1]?.id &&
                  msg.role === 'assistant'
                }
              />
            );
          })
        )}

        {status === 'submitted' && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--chart-2)]/10 text-[var(--chart-2)]">
              <Sparkles size={16} />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error.message || t('ai.error')}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="mt-3 shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai.placeholder')}
              rows={1}
              className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors max-h-[120px] shadow-sm"
              style={{ height: 'auto', minHeight: '48px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || status !== 'ready'}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
