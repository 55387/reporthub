import { createOpenAI } from '@ai-sdk/openai';
import { getSupabaseServerClient } from './supabase';

const TABLE = 'utterance_insights';

/**
 * Create OpenAI-compatible provider
 * Supports custom base URL for DeepSeek, Qwen, etc.
 */
export function getAIProvider() {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
}

/**
 * Get the model ID to use
 */
export function getModelId(): string {
  return process.env.AI_MODEL || 'gpt-4o-mini';
}

/**
 * Build a context-aware system prompt by fetching summary stats from Supabase
 */
export async function buildSystemPrompt(
  pageContext?: string
): Promise<string> {
  const supabase = getSupabaseServerClient();

  // Fetch summary data for context
  const [
    { count: totalShares },
    { data: speakers },
    { data: topics },
    { data: dateRange },
  ] = await Promise.all([
    supabase.from(TABLE).select('*', { count: 'exact', head: true }),
    supabase.from(TABLE).select('speaker'),
    supabase.from(TABLE).select('topic'),
    supabase.from(TABLE).select('share_date').order('share_date'),
  ]);

  const uniqueSpeakers = [...new Set(speakers?.map((s) => s.speaker) || [])];
  const uniqueTopics = [...new Set(topics?.map((t) => t.topic) || [])];
  const dates = dateRange?.map((d) => d.share_date) || [];
  const firstDate = dates[0] || 'unknown';
  const lastDate = dates[dates.length - 1] || 'unknown';

  let prompt = `你是"晨读营智能助手"，专门为"21天7个习惯晨读营"提供数据分析和洞察。

## 数据概况
- 总分享数：${totalShares || 0} 条
- 分享者：${uniqueSpeakers.length} 位 (${uniqueSpeakers.slice(0, 10).join('、')}${uniqueSpeakers.length > 10 ? '...' : ''})
- 话题：${uniqueTopics.length} 个 (${uniqueTopics.join('、')})
- 时间范围：${firstDate} 到 ${lastDate}

## 数据结构
每条分享包含：分享者(speaker)、话题(topic)、分享日期(share_date)、原文(original_text)、正见(right_view[])、概念(concepts[])、心得(insights[])、解决的问题(problems_solved[])、外卖(takeaway)。

## 你的能力
1. **数据问答**：回答关于晨读营数据的各类问题
2. **趋势洞察**：分析书友们在 21 天中的认知变化趋势
3. **交叉分析**：发现不同话题、分享者之间的关联
4. **精华提炼**：总结某个话题或时间段的核心洞察
5. **分享推荐**：根据用户兴趣推荐最相关的分享

## 回答要求
- 回答简洁、有数据支撑
- 使用 Markdown 格式排版
- 引用具体数据时标注来源
- 主动提供进一步分析建议
- 回答语言和用户提问语言保持一致`;

  if (pageContext) {
    prompt += `\n\n## 当前页面上下文\n用户当前正在查看: ${pageContext}`;
  }

  return prompt;
}

/**
 * Suggested prompts for users
 */
export const SUGGESTED_PROMPTS = {
  zh: [
    '书友们最关心的家庭问题有哪些？',
    '21天中大家的认知有什么变化趋势？',
    '哪些正见被提及最多？为什么？',
    '总结一下关于"以终为始"的精华洞察',
    '最活跃的分享者有什么共同特点？',
    '不同话题之间有什么关联性？',
  ],
  en: [
    'What family issues are readers most concerned about?',
    'What cognitive trends emerged over 21 days?',
    'Which right views are mentioned most and why?',
    'Summarize key insights about "Begin with the End in Mind"',
    'What do the most active sharers have in common?',
    'What connections exist between different topics?',
  ],
} as const;
