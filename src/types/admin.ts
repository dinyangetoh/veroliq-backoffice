export type GrowthMetricKey =
  | 'users'
  | 'sites'
  | 'leads'
  | 'allSessions'
  | 'chatSessions'
  | 'emptySessions'
  | 'messages'
  | 'events';

export type GrowthCounts = Record<GrowthMetricKey, number | null>;

export type WindowCounts = {
  from: string;
  to: string;
} & Record<GrowthMetricKey, number>;

export type PlatformMetrics = {
  totals: {
    users: number;
    sites: number;
    leads: number;
    sessions: number;
    allSessions: number;
    chatSessions: number;
    emptySessions: number;
    messages: number;
    crawls: number;
    events: number;
    sitesLive: number;
    usersVerified: number;
  };
  users: number;
  sites: number;
  leads: number;
  sessions: number;
  allSessions: number;
  chatSessions: number;
  emptySessions: number;
  messages: number;
  crawls: number;
  events: number;
  mrr: number;
  churnRisk: number;
  windows: {
    week: WindowCounts;
    month: WindowCounts;
    prevWeek: WindowCounts;
    prevMonth: WindowCounts;
  };
  growth: {
    week: GrowthCounts;
    month: GrowthCounts;
  };
  timeline: {
    granularity: 'day';
    labels: string[];
    users: number[];
    sites: number[];
    leads: number[];
    sessions: number[];
    allSessions: number[];
    chatSessions: number[];
  };
  recentSignups: Array<{
    id: string;
    email: string;
    plan: string;
    createdAt: string;
  }>;
  topSitesThisMonth: Array<{
    siteId: string;
    domain: string;
    leads: number;
    chats: number;
  }>;
  generatedAt: string;
};

export type AdminSite = {
  id: string;
  domain: string;
  name: string;
  crawlStatus: string;
  lastCrawled: string | null;
  pageCount: number;
  widgetLive: boolean;
  widgetLastSeenAt: string | null;
  verificationStatus: string;
  chatsThisMonth: number;
  leadsThisMonth: number;
  createdAt: string;
  user?: { email: string; plan?: string };
};

export type AdminSiteDetail = AdminSite & {
  user: { id: string; email: string; plan: string; createdAt: string };
  widgetConfig: {
    brandColor?: string;
    greeting?: string;
    companyName?: string;
    position?: string;
    chips?: string[];
  } | null;
  aiSettings: { model?: string; confidenceThreshold?: number } | null;
  knowledgeSources: Array<{ id: string; type: string; label: string; status: string }>;
  latestCrawl: {
    id: string;
    status: string;
    pagesFound: number;
    pagesEmbedded: number;
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  stats: { chatsThisMonth: number; leadsThisMonth: number; conversionRate: number };
};

export type SiteDashboard = {
  period: { label: string; from: string; to: string; effectiveDays: number };
  overview: {
    totalChats: number;
    uniqueSessions: number;
    leadsCaptured: number;
    conversionRate: number;
    avgMessagesPerSession: number;
    avgResponseTimeMs: number;
    widgetOpenRate: number;
    activeToday: number;
    deltas: { chats: number; leads: number; conversionRate: number };
  };
  funnel: {
    stages: Array<{ stage: string; label: string; count: number; percent: number }>;
    chatToLeadRate: number;
    visitorToLeadRate: number;
  };
  trend: { labels: string[]; chats: number[]; leads: number[] };
  aiPerformance: {
    questionsAnswered: number;
    questionsUnanswered: number;
    answerRate: number;
    avgConfidenceScore: number;
    confidenceThresholdPercent: number;
  };
};

export type SessionListResponse = {
  sessions: Array<{
    id: string;
    sessionToken: string;
    pageUrl: string;
    startedAt: string;
    messageCount: number;
    hasLead?: boolean;
    site?: { domain: string };
  }>;
  total: number;
  page: number;
  limit: number;
  chatOnly: boolean;
  counts: {
    allSessions: number;
    chatSessions: number;
    emptySessions: number;
  };
};

export type SessionDetailResponse = {
  session: {
    id: string;
    sessionToken: string;
    startedAt: string;
    pageUrl: string;
    messageCount: number;
    hasLead: boolean;
    site?: { id: string; domain: string };
    leadCaptured?: boolean;
  };
  stats: {
    assistantMessageCount: number;
    avgResponseTimeMs: number | null;
    avgConfidenceScore: number | null;
  };
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | string;
    content: string;
    createdAt: string;
    responseTimeMs?: number | null;
    confidenceScore?: number | null;
  }>;
};

export type MessageListResponse = {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | string;
    content: string;
    createdAt: string;
    confidenceScore?: number | null;
    responseTimeMs?: number | null;
    intentDetected?: string | null;
    intentScore?: number | null;
    session: {
      id: string;
      sessionToken: string;
      pageUrl: string;
      startedAt: string;
      siteId: string;
      leadCaptured: boolean;
      messageCount: number;
      site: { domain: string };
    };
  }>;
  total: number;
  page: number;
  limit: number;
};
