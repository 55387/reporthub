'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useLocale } from '@/components/providers/locale-provider';
import { AiMessage } from './ai-message';
import { SUGGESTED_PROMPTS } from '@/lib/ai';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

const transport = new DefaultChatTransport({ api: '/api/ai/chat' });

export function AiPanel() {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get page context from current route
  const getPageContext = useCallback(() => {
    let routeContext = '';
    if (pathname === '/') routeContext = 'Dashboard 总览页';
    else if (pathname.startsWith('/shares/')) routeContext = '分享详情页';
    else if (pathname === '/shares') routeContext = '分享浏览页';
    else if (pathname === '/analysis') routeContext = '多维分析页';
    else if (pathname === '/settings') routeContext = '设置页';
    else if (pathname === '/ai') routeContext = 'AI 对话页 (全屏)';
    else routeContext = pathname;

    let pageContent = '';
    try {
      // Find the main content area (defined in app/layout.tsx as <main>)
      const mainElement = document.querySelector('main');
      if (mainElement) {
        // Extract inner text, collapse multiple newlines, and limit length to avoid massive prompts
        pageContent = mainElement.innerText.replace(/\n{2,}/g, '\n').trim().slice(0, 3000);
      }
    } catch (e) {
      console.error('Failed to extract page content', e);
    }

    if (pageContent) {
      return `当前页面路由: ${routeContext}\n\n当前页面可见的文本内容：\n"""\n${pageContent}\n"""`;
    }

    return routeContext;
  }, [pathname]);

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const doSend = useCallback(() => {
    if (!input.trim() || status !== 'ready') return;
    sendMessage(
      { text: input },
      { body: { context: getPageContext() } }
    );
    setInput('');
  }, [input, status, sendMessage, getPageContext]);

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(
      { text: prompt },
      { body: { context: getPageContext() } }
    );
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleGoFullPage = () => {
    setIsOpen(false);
    router.push('/ai');
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

  // Don't show FAB on /ai page (it has its own full-page experience)
  if (pathname === '/ai') return null;

  return (
    <>
      {/* FAB Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/40 active:scale-95 md:bottom-8 md:right-8"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={24} className="animate-pulse" />
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        </button>
      )}

      {/* Panel Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity md:bg-transparent md:backdrop-blur-none"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-card border border-border shadow-2xl transition-all duration-300 ${
            isExpanded
              ? 'inset-4 rounded-2xl'
              : 'bottom-0 right-0 w-full h-[85vh] rounded-t-2xl md:bottom-6 md:right-6 md:w-[420px] md:h-[600px] md:rounded-2xl'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Bot size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t('ai.title')}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {t('ai.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title={t('ai.clearChat')}
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                onClick={handleGoFullPage}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={t('ai.fullPage')}
              >
                <Maximize2 size={15} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Sparkles size={28} className="text-primary" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-1">
                  {t('ai.welcome')}
                </h4>
                <p className="text-xs text-muted-foreground mb-6 max-w-[280px]">
                  {t('ai.welcomeDesc')}
                </p>
                <div className="w-full space-y-2">
                  {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="w-full text-left px-3 py-2.5 rounded-xl border border-border text-xs text-foreground hover:bg-muted/50 hover:border-primary/30 transition-all duration-200"
                    >
                      <span className="text-primary mr-1.5">✦</span>
                      {prompt}
                    </button>
                  ))}
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
                  <Bot size={16} />
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
              <div className="mx-auto max-w-[280px] rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 px-4 py-3 text-xs text-red-600 dark:text-red-400">
                {error.message || t('ai.error')}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-3 shrink-0">
            <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('ai.placeholder')}
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors max-h-[100px]"
                  style={{ height: 'auto', minHeight: '40px' }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || status !== 'ready'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-all duration-200 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
