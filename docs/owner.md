
## 目标：
开发一个数据展示后台 reporthub

## 需求背景：

21 天 7 个习惯晨读营，书友有很多分享， 比如：

```书友分享开始
大家早上好。我最近几天有一个感悟，今天“成功论”这个主题恰好把它提炼了出来。

前两天我还在跟我先生感慨，我们从小就被教育要努力、要上进、要出人头地，要有钱有权有势。因为我们都来自普通的农村家庭，父母从小就这样教导我们。甚至昨天我父亲还在电话里跟我说，要教育我弟弟上进，让他承担起家庭和家族的责任。我当时很想问他，弟弟才21岁，家庭责任尚可理解，但“家族责任”究竟是什么？不过最后还是忍住了。我们从小就听着这样的话长大，尤其是作为家中的老大（我和我先生都是），更是被反复叮嘱要承担责任、要成功。

然而，自从我来到晨读营，我发现一个事实，正如书中所说：很多获得世俗意义上成功的人，其实也未必过得非常幸福和开心。这个感悟在晨读营里得到了印证。我们这里有很多在世俗眼光中非常成功的书友，但他们同样有自己的困惑、焦虑和担忧，与书中列举的十种情况并无二致，涉及工作、家庭、生活等方方面面。

我突然意识到，过去父母、家庭甚至学校灌输给我的观念或许并不完全正确。人生并非在有钱有权有势之后，就会变得幸福开朗、再无烦恼，事实并非如此。真正的幸福，反而像这篇文章所说，源于一个人拥有了良好的内在品德。

这让我想起刚才张敏提到的，她在上海和洛阳看到一群正在“修心修性”的人，他们反而活出了我们所向往的那种幸福和快乐。我也去过几次观照功坊，发现大家在那种状态下，也能活出一种发自内心的喜悦。这让我深刻体会到，真正的开心和幸福，不是靠从外界获得了多少资源或认可来换取的，反而是从我们自己的内心修得的。

这种幸福，是从内心生长出来的一种对自己的自信和认可。就像娜娜刚才分享的，哪怕我今天画的画不完美，我依然觉得它是一个很好的作品。这种快乐是基于我们自身，而不是来自于外界的名利场或他人的评价。

我的总结是：改变从内开始，而不是向外求。谢谢大家！

```书友分享结束

这类的分线个大概有 2000 篇。

我做了一个 ai 分析， 分析的提示词如下， 把分析结果保存到了 supabase 数据库中。


```AI分析提示词
# 角色
你是一位资深读书会内容分析师。你的工作是：从书友的口语化分享中提炼结构化观点，输出可直接发布的 JSON 内容。

# 输入
书友分享原文：
"""
{{ $json.data }}
"""

# 任务
对上述分享内容完成以下 5 项提取，然后严格按指定 JSON 格式输出。

---

## 1. original — 原文整理
- 保留书友的名字，格式为"书友名字：整理后的内容"
- 去除时间戳、口误、重复语句、语气词（嗯、啊、就是说）
- 保留原意和原文关键表述，不要改写观点，不要添加原文没有的内容
- 将口语整理为可读的书面语，保持分享者的语气和风格

## 2. right_view — 正见
- 提取分享中**符合正确认知、积极价值观**的观点
- 每条用**一句陈述句**概括，不超过 30 字
- 只提取分享中**明确表达**的观点，不要推理延伸
- 条数：3–7 条，按出现顺序排列

## 3. concepts — 关键概念
- 列出分享中出现的**专有名词、术语、核心概念**
- 每个概念附一句话解释**其在本次分享语境中的具体含义**（不是百科定义）
- 如果分享中没有明确的概念术语，可提取分享者反复强调的**关键词**
- 条数：2–5 个

## 4. insights — 心得触动
- 提取听众听完分享后**可能产生的感悟、情感共鸣或认知转变**
- 用第一人称"我"的视角书写，如："原来我一直把 X 当成了 Y"
- 每条不超过 40 字
- 条数：2–5 条

## 5. problems_solved — 解决问题
- 归纳这段分享能帮助听众解决的**具体现实问题**
- 用"如何……"或"当……时怎么办"句式
- 问题必须具体，禁止笼统表述（如"如何过好一生"）
- 条数：2–5 条

## 6. key_takeaway — 关键分享文案
从以上提取内容中，选出 **1 个最核心的点**，写一篇 1500 字左右的分享文案。

### 结构（严格四段，每段用空行分隔）

| 段落 | 要求 | 字数 |
|------|------|------|
| **① 故事切入** | 深刻讲述，能启发心灵，引起共鸣的故事！！！用分享中的真实案例/场景开头。必须具体到**人物、行为、对话、细节、内心活动等**，禁止抽象概括。 | 字数不限 |
| **② 本质洞察** | 从故事中提炼一个**反常识或容易被忽视的认知**。用"很多人以为……其实……"或"表面上是……本质上是……"的句式揭示。 | 150–250 字 |
| **③ 共鸣追问** | 用一个**与读者日常生活直接相关**的场景或问题制造代入感，让读者想到自己的经历。可以用"你有没有过这样的时刻——"开头。 | 150–200 字 |
| **④ 行动锚点** | 给出 **1 个具体的、马上能做的最小行动**。必须具体到：在什么场景、对谁、说什么话/做什么事。 | 150–200 字 |

### 语言风格
- 短句为主，每句不超过 20 字
- 每段最多 5 句话
- 口语化，像对朋友说话，不是写论文
- **禁止使用的词语**：赋能、能量、维度、底层逻辑、赛道、抓手、沉淀、闭环、链路、颗粒度、对齐、拉通
- **禁止的句式**：空洞号召（"让我们一起……""共同创造……""愿我们都能……"）
- **禁止**：排比抒情、名人名言堆砌

### ❌ 反面示例
> "让我们用爱去温暖世界，共同创造更美好的明天。在这个充满能量的时代，我们需要从底层逻辑出发，赋能自己的人生赛道。"

→ 空洞 + 全是禁用词 + 没有行动指引

### ✅ 正面示例
> "下次孩子说'我不行'的时候，别急着讲道理。蹲下来，看着他的眼睛，说一句：'你上次也觉得不行，后来不是做到了吗？'这一句话，比一百句'你要自信'都管用。"

→ 有场景、有对象、有具体话术、有对比

---

# 输出要求

1. **只输出 JSON**，不要输出任何解释、前缀、后缀、markdown 代码块标记
2. 所有字符串值中的换行用 `\n` 表示
3. 确保 JSON 合法可解析

```json
{
  "original": "书友名字：整理后的分享内容",
  "right_view": ["观点1", "观点2", "..."],
  "concepts": [
    {"name": "概念名", "definition": "在本次分享中的含义"}
  ],
  "insights": ["触动1", "触动2", "..."],
  "problems_solved": ["问题1", "问题2", "..."],
  "key_takeaway": {
    "summary": "一句话核心概括（不超过20字）",
    "content": "四段式完整文案（约800字）"
  }
}
```
```AI分析提示词结束

AI 分析的果果



## 参考资料：

### 数据表结构：

CREATE TABLE utterance_insights (
    id                  SERIAL PRIMARY KEY,   --- id
    speaker             VARCHAR(100) NOT NULL,      --- 分享员
    subject             VARCHAR(255) NOT NULL,      --- 每次晨读营的主题，目前是空的
    topic               VARCHAR(255) NOT NULL,      --- 话题（更这 21 天读书会的共读内容走）
    share_date          DATE NOT NULL,      --- 分享的日期
    utterance           TEXT NOT NULL,      --- 分享的内容
    file_name           VARCHAR(255) NOT NULL ,     --- 书友分享时etl 过程中的文件名
    gdrive_id           VARCHAR(100) NOT NULL UNIQUE,       --- 保存在 google drive 的 id
    right_view          TEXT[] NOT NULL DEFAULT '{}',   --- 正见，提取书友分享中提炼的正确认识
    concepts            TEXT[] NOT NULL DEFAULT '{}',   --- 概念，提取书友分享中的核心概念
    insights            TEXT[] NOT NULL DEFAULT '{}',   --- 心得，提取书友分享内容中形成的观众的心得或者触动点，共鸣点。
    problems_solved     TEXT[] NOT NULL DEFAULT '{}',   --- 解决的问题， 归纳这段分享能帮助听众解决的**具体现实问题**
    takeaway_summary    VARCHAR(255),       --- takeaway summary 是
    takeaway_content    TEXT,           --- 从书友的分享中，提取 1 个关键点，生成一个分享，目标导引书友获得正确的认知，形成正确的共鸣，进而带动解决现实生活的问题。
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_shares_sharer ON utterance_insights(speaker);
CREATE INDEX idx_shares_topic ON utterance_insights(topic);
CREATE INDEX idx_shares_date ON utterance_insights(share_date);
CREATE INDEX idx_filename ON utterance_insights(file_name);



### 数据库连接：
YOUR-PASSWORD：6u!BSzftfyETZ!gZZ
postgresql://postgres:[YOUR-PASSWORD]@db.amlaxtsxnglnrydkebfw.supabase.co:5432/postgres

### 数据量
2000+条数据

## 需求
开发带 AI 功能一个数据BI 后台，展示和深度分析挖掘用户的分享。


## 项目的 PRD

---

## 项目：ReportHub — 21天晨读营数据展示与分析后台

---

### 一、项目概述

为"21天7个习惯晨读营"开发一个数据展示与分析后台（ReportHub）。该晨读营已积累 2000+ 篇书友分享，每篇分享已经过 AI 结构化分析，存储在 Supabase PostgreSQL 数据库中。现需构建一个可视化后台，支持数据浏览、多维度统计分析，以及基于 AI 的深度洞察挖掘。

---

### 二、数据基础

#### 2.1 数据表结构

```sql
CREATE TABLE utterance_insights (
    id                  SERIAL PRIMARY KEY,
    speaker             VARCHAR(100) NOT NULL,        -- 分享者姓名
    subject             VARCHAR(255) NOT NULL,        -- 晨读营主题（当前为空）
    topic               VARCHAR(255) NOT NULL,        -- 话题（对应21天共读内容）
    share_date          DATE NOT NULL,                -- 分享日期
    utterance           TEXT NOT NULL,                -- 原始分享内容
    file_name           VARCHAR(255) NOT NULL,        -- ETL 过程中的文件名
    gdrive_id           VARCHAR(100) NOT NULL UNIQUE, -- Google Drive 文件 ID
    right_view          TEXT[] NOT NULL DEFAULT '{}',  -- 正见：提炼的正确认知观点
    concepts            TEXT[] NOT NULL DEFAULT '{}',  -- 关键概念及语境释义
    insights            TEXT[] NOT NULL DEFAULT '{}',  -- 心得触动：听众共鸣点
    problems_solved     TEXT[] NOT NULL DEFAULT '{}',  -- 解决的具体现实问题
    takeaway_summary    VARCHAR(255),                 -- 关键要点一句话概括
    takeaway_content    TEXT,                         -- 基于分享生成的引导性文案（约1500字）
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shares_sharer ON utterance_insights(speaker);
CREATE INDEX idx_shares_topic ON utterance_insights(topic);
CREATE INDEX idx_shares_date ON utterance_insights(share_date);
CREATE INDEX idx_filename ON utterance_insights(file_name);
```

#### 2.2 数据库连接

```
Host: db.amlaxtsxnglnrydkebfw.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: 6u!BSzftfyETZ!gZZ
```

#### 2.3 数据规模

- 记录总量：2000+ 条
- 时间跨度：21 天晨读周期
- 分享者：多人，重复参与

---

### 三、功能需求

#### 3.1 Dashboard 总览页

| 模块 | 说明 |
|------|------|
| 核心指标卡片 | 分享总数、分享者人数、覆盖话题数、日均分享量 |
| 时间趋势图 | 按日期展示分享量变化（折线图/柱状图） |
| 话题分布图 | 各 topic 的分享数量分布（饼图或树状图） |
| 活跃分享者排行 | Top 10/20 分享者及其分享次数（横向柱状图） |
| 最新分享列表 | 最近 10 条分享的摘要预览，可点击查看详情 |

#### 3.2 分享浏览与检索页

| 功能 | 说明 |
|------|------|
| 分享列表 | 分页展示所有分享记录，显示：分享者、日期、话题、takeaway_summary |
| 筛选条件 | 按分享者（speaker）、话题（topic）、日期范围（share_date）筛选 |
| 全文搜索 | 对 utterance、takeaway_content 进行关键词搜索 |
| 详情页 | 点击展开单条分享的完整信息：原文、正见列表、概念列表、心得列表、解决问题列表、关键文案全文 |

#### 3.3 多维分析页

| 分析维度 | 可视化形式 | 说明 |
|----------|-----------|------|
| 正见（right_view）词频 | 词云 / 柱状图 | 统计所有分享中出现频率最高的正见观点 |
| 概念（concepts）热度 | 气泡图 / 排行榜 | 哪些概念被提及最多 |
| 心得触动（insights）聚类 | 分类卡片 | 将相似的心得归类展示 |
| 问题（problems_solved）图谱 | 分类列表 / 桑基图 | 书友们普遍面临的问题分布 |
| 分享者画像 | 雷达图 / 卡片 | 单个分享者的分享频率、关注话题、核心观点概览 |
| 话题深度分析 | 组合图表 | 选定一个 topic，展示该话题下的正见、概念、问题汇总 |

#### 3.4 AI 深度分析功能

| 功能 | 说明 |
|------|------|
| 智能问答 | 用户输入自然语言问题（如"书友们最关心的家庭问题有哪些？"），系统基于数据库数据生成回答 |
| 趋势洞察 | AI 自动分析 21 天中书友认知变化的趋势，生成"成长轨迹报告" |
| 交叉分析 | AI 发现不同话题之间的关联（如"讨论'以终为始'的书友，是否也更关注家庭关系问题"） |
| 精华提炼 | 按话题/时间段，AI 自动生成该阶段的"精华洞察摘要" |
| 分享推荐 | 根据用户选择的问题或兴趣，推荐最相关的书友分享 |

---

### 四、技术要求

#### 4.1 技术栈

| 层级 | 技术选择 |
|------|---------|
| 前端 | Next.js 14+ (App Router) + TypeScript |
| UI 组件 | shadcn/ui + Tailwind CSS |
| 图表库 | Recharts 或 ECharts |
| 词云 | react-wordcloud 或 d3-cloud |
| 后端/API | Next.js API Routes（连接 Supabase） |
| 数据库 | Supabase PostgreSQL（直接连接，使用 @supabase/supabase-js 或 pg 驱动） |
| AI 能力 | OpenAI API（GPT-4）用于智能问答和深度分析 |
| 部署 | Vercel 或 Docker |

#### 4.2 非功能要求

- **响应速度**：列表页首屏加载 < 2 秒，图表渲染 < 1 秒
- **分页策略**：列表数据每页 20 条，支持服务端分页
- **数据数组处理**：right_view、concepts、insights、problems_solved 均为 PostgreSQL TEXT[] 类型，需正确解析和展示
- **移动端适配**：Dashboard 和列表页支持响应式布局
- **中文优先**：所有界面文案使用中文

#### 4.3 项目结构（参考）

```
reporthub/
├── app/
│   ├── page.tsx                    # Dashboard 总览
│   ├── shares/
│   │   ├── page.tsx                # 分享列表页
│   │   └── [id]/page.tsx           # 分享详情页
│   ├── analysis/
│   │   ├── page.tsx                # 多维分析页
│   │   ├── speaker/[name]/page.tsx # 分享者画像
│   │   └── topic/[topic]/page.tsx  # 话题深度分析
│   ├── ai/
│   │   └── page.tsx                # AI 智能问答页
│   └── api/
│       ├── shares/route.ts         # 分享数据 CRUD API
│       ├── stats/route.ts          # 统计数据 API
│       ├── analysis/route.ts       # 分析数据 API
│       └── ai/chat/route.ts        # AI 问答 API
├── components/
│   ├── dashboard/                  # Dashboard 组件
│   ├── shares/                     # 分享相关组件
│   ├── charts/                     # 图表组件
│   └── layout/                     # 布局组件
├── lib/
│   ├── supabase.ts                 # 数据库连接
│   ├── queries.ts                  # 数据库查询函数
│   └── ai.ts                       # AI 相关工具函数
└── types/
    └── index.ts                    # TypeScript 类型定义
```

---

### 五、实现优先级

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| P0 | 数据库连接 + 类型定义 + 基础布局 | 🔴 最高 |
| P0 | Dashboard 总览页（指标卡片 + 时间趋势 + 话题分布 + 排行榜） | 🔴 最高 |
| P0 | 分享列表页（分页 + 筛选 + 搜索 + 详情） | 🔴 最高 |
| P1 | 多维分析页（词频统计 + 概念热度 + 问题分布） | 🟡 高 |
| P1 | 分享者画像 + 话题深度分析 | 🟡 高 |
| P2 | AI 智能问答 | 🟢 中 |
| P2 | AI 趋势洞察 + 精华提炼 | 🟢 中 |
| P3 | AI 交叉分析 + 分享推荐 | 🔵 低 |

---

### 六、交付要求

1. **可独立运行**：提供完整代码，配置好环境变量后可直接 `npm run dev` 启动
2. **环境变量**：数据库连接信息和 AI API Key 通过 `.env.local` 配置
3. **真实数据**：所有页面使用 Supabase 中的真实数据渲染，不使用 mock 数据
4. **代码质量**：TypeScript 严格模式，组件拆分合理，API 层与 UI 层分离

---

*请从 P0 阶段开始实现，先完成数据库连接验证，再逐步构建各页面。*