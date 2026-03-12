'use client';

import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import { mermaid } from '@streamdown/mermaid';
import { math } from '@streamdown/math';
import { cjk } from '@streamdown/cjk';
import 'katex/dist/katex.min.css';
import { Bot, User } from 'lucide-react';

interface AiMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function AiMessage({ role, content, isStreaming }: AiMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser
            ? 'bg-primary/10 text-primary'
            : 'bg-[var(--chart-2)]/10 text-[var(--chart-2)]'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white rounded-tr-md'
            : 'bg-muted text-foreground rounded-tl-md'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_code]:text-xs [&_pre]:text-xs">
            <Streamdown 
              plugins={{ code, mermaid, math, cjk }} 
              isAnimating={isStreaming}
            >
              {content}
            </Streamdown>
          </div>
        )}
      </div>
    </div>
  );
}
