import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AdminSite,
  AdminSiteDetail,
  PlatformMetrics,
  MessageListResponse,
  SessionDetailResponse,
  SessionListResponse,
  SiteDashboard,
} from '@/types/admin';

const baseUrl =
  process.env.NEXT_PUBLIC_VEROLIQ_API_URL || 'http://localhost:3001';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
});

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: rawBaseQuery,
  tagTypes: [
    'Admin',
    'Sites',
    'Sessions',
    'Messages',
    'Leads',
    'Crawls',
    'Events',
    'Customers',
    'NotificationTemplates',
    'Notifications',
    'NotificationMetrics',
    'AdminSession',
  ],
  endpoints: (builder) => ({
    adminLogin: builder.mutation<
      { email: string; accessTokenExpiresIn: string },
      { email: string; password: string }
    >({
      query: (body) => ({ url: '/admin/auth/login', method: 'POST', body }),
      invalidatesTags: ['AdminSession'],
    }),
    adminLogout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/admin/auth/logout', method: 'POST' }),
      invalidatesTags: ['AdminSession'],
    }),
    getMetrics: builder.query<PlatformMetrics, void>({
      query: () => '/admin/metrics',
      providesTags: ['Admin'],
    }),
    getSites: builder.query<
      { sites: AdminSite[]; total: number; page: number; limit: number },
      { page?: number; limit?: number; q?: string; live?: boolean } | void
    >({
      query: (params) => ({
        url: '/admin/sites',
        params: params
          ? {
              page: params.page,
              limit: params.limit,
              q: params.q,
              live: params.live ? '1' : undefined,
            }
          : undefined,
      }),
      providesTags: ['Sites'],
    }),
    getSiteDetail: builder.query<{ site: AdminSiteDetail }, string>({
      query: (siteId) => `/admin/sites/${siteId}`,
      providesTags: (_r, _e, siteId) => [{ type: 'Sites', id: siteId }],
    }),
    getSiteDashboard: builder.query<
      SiteDashboard,
      { siteId: string; days?: number }
    >({
      query: ({ siteId, days }) => ({
        url: `/admin/sites/${siteId}/dashboard`,
        params: days ? { days } : undefined,
      }),
      providesTags: (_r, _e, { siteId }) => [{ type: 'Sites', id: siteId }],
    }),
    getSiteSessions: builder.query<
      SessionListResponse,
      { siteId: string; page?: number; limit?: number; chatOnly?: boolean }
    >({
      query: ({ siteId, page, limit, chatOnly }) => ({
        url: `/admin/sites/${siteId}/sessions`,
        params: { page, limit, chatOnly: chatOnly == null ? undefined : (chatOnly ? '1' : '0') },
      }),
      providesTags: ['Sessions'],
    }),
    getSiteSessionDetail: builder.query<
      SessionDetailResponse,
      { siteId: string; sessionId: string }
    >({
      query: ({ siteId, sessionId }) => `/admin/sites/${siteId}/sessions/${sessionId}`,
      providesTags: ['Sessions'],
    }),
    getSiteLeads: builder.query<
      { leads: unknown[]; total: number; page: number; limit: number },
      { siteId: string; page?: number; limit?: number }
    >({
      query: ({ siteId, page, limit }) => ({
        url: `/admin/sites/${siteId}/leads`,
        params: { page, limit },
      }),
      providesTags: ['Leads'],
    }),
    getSiteCrawls: builder.query<
      { crawls: unknown[]; total: number; page: number; limit: number },
      { siteId: string; page?: number; limit?: number }
    >({
      query: ({ siteId, page, limit }) => ({
        url: `/admin/sites/${siteId}/crawls`,
        params: { page, limit },
      }),
      providesTags: ['Crawls'],
    }),
    getSiteEvents: builder.query<
      { events: unknown[]; total: number; page: number; limit: number },
      { siteId: string; page?: number; limit?: number; type?: string }
    >({
      query: ({ siteId, page, limit, type }) => ({
        url: `/admin/sites/${siteId}/events`,
        params: { page, limit, type },
      }),
      providesTags: ['Events'],
    }),
    getSessions: builder.query<
      SessionListResponse,
      { page?: number; limit?: number; chatOnly?: boolean } | void
    >({
      query: (params) => ({
        url: '/admin/sessions',
        params: params
          ? {
              page: params.page,
              limit: params.limit,
              chatOnly: params.chatOnly == null ? undefined : (params.chatOnly ? '1' : '0'),
            }
          : undefined,
      }),
      providesTags: ['Sessions'],
    }),
    getMessages: builder.query<
      MessageListResponse,
      {
        page?: number;
        limit?: number;
        siteId?: string;
        sessionId?: string;
        role?: 'user' | 'assistant';
        q?: string;
        from?: string;
        to?: string;
        hasLead?: boolean;
      } | void
    >({
      query: (params) => ({
        url: '/admin/messages',
        params: params
          ? {
              page: params.page,
              limit: params.limit,
              siteId: params.siteId,
              sessionId: params.sessionId,
              role: params.role,
              q: params.q,
              from: params.from,
              to: params.to,
              hasLead: params.hasLead == null ? undefined : (params.hasLead ? '1' : '0'),
            }
          : undefined,
      }),
      providesTags: ['Messages'],
    }),
    getSessionMessages: builder.query<
      SessionDetailResponse,
      { sessionId: string }
    >({
      query: ({ sessionId }) => `/admin/sessions/${sessionId}/messages`,
      providesTags: ['Messages'],
    }),
    getLeads: builder.query<any, void>({
      query: () => '/admin/leads',
      providesTags: ['Leads'],
    }),
    getCrawls: builder.query<any, void>({
      query: () => '/admin/crawls',
      providesTags: ['Crawls'],
    }),
    getEvents: builder.query<any, void>({
      query: () => '/admin/events',
      providesTags: ['Events'],
    }),
    getCustomersHealth: builder.query<any, void>({
      query: () => '/admin/customers/health',
      providesTags: ['Customers'],
    }),
    getCustomerDetail: builder.query<any, string>({
      query: (userId) => `/admin/customers/${userId}`,
      providesTags: ['Customers'],
    }),
    getNotificationTemplates: builder.query<
      {
        templates: Array<{
          id: string;
          name: string;
          description: string;
          trigger: string;
          variables: string[];
          subject: string;
          sampleHtml: string;
          sampleText: string;
        }>;
      },
      void
    >({
      query: () => '/admin/notification-templates',
      providesTags: ['NotificationTemplates'],
    }),
    previewNotificationTemplate: builder.query<
      {
        id: string;
        payload: Record<string, unknown>;
        subject: string;
        html: string;
        text: string;
        preheader?: string;
      },
      { id: string; overrides?: Record<string, string> }
    >({
      query: ({ id, overrides }) => ({
        url: `/admin/notification-templates/${id}/preview`,
        params: overrides,
      }),
      providesTags: (_r, _e, { id }) => [
        { type: 'NotificationTemplates', id },
      ],
    }),
    getNotifications: builder.query<
      {
        items: Array<{
          id: string;
          templateId: string;
          channel: string;
          priority: string;
          status: string;
          toAddress: string;
          subject?: string;
          attempts: number;
          scheduledAt?: string;
          sentAt?: string;
          failedAt?: string;
          errorMessage?: string;
          siteId?: string;
          userId?: string;
          createdAt: string;
        }>;
        total: number;
        page: number;
        limit: number;
      },
      {
        page?: number;
        limit?: number;
        status?: string;
        channel?: string;
        templateId?: string;
        q?: string;
        from?: string;
        to?: string;
      }
    >({
      query: (params) => ({ url: '/admin/notifications', params }),
      providesTags: ['Notifications'],
    }),
    getNotificationDetail: builder.query<any, { id: string; reveal?: boolean }>({
      query: ({ id, reveal }) => ({
        url: `/admin/notifications/${id}`,
        params: reveal ? { reveal: 1 } : undefined,
      }),
      providesTags: (_r, _e, { id }) => [{ type: 'Notifications', id }],
    }),
    getNotificationMetrics: builder.query<
      {
        range: { from: string; to: string; granularity: 'hour' | 'day'; key: string };
        totals: {
          total: number;
          sent: number;
          failed: number;
          cancelled: number;
          queued: number;
          deliveryRate: number;
          failureRate: number;
          averageLatencyMs: number | null;
        };
        timeline: Array<{
          ts: string;
          sent: number;
          failed: number;
          pending: number;
          queued: number;
          cancelled: number;
        }>;
        byTemplate: Array<{ templateId: string; status: string; count: number }>;
        byChannel: Array<{ channel: string; status: string; count: number }>;
        topFailures: Array<{ message: string; count: number; lastSeen?: string }>;
      },
      { range?: '24h' | '7d' | '30d'; templateId?: string }
    >({
      query: (params) => ({ url: '/admin/notifications/metrics', params }),
      providesTags: ['NotificationMetrics'],
    }),
    getNotificationsQueueHealth: builder.query<
      { name: string; counts: Record<string, number> },
      void
    >({
      query: () => '/admin/notifications/queue/health',
      providesTags: ['NotificationMetrics'],
    }),
    retryNotification: builder.mutation<{ jobId: string }, string>({
      query: (id) => ({ url: `/admin/notifications/${id}/retry`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Notifications', id },
        'Notifications',
        'NotificationMetrics',
      ],
    }),
    cancelNotification: builder.mutation<{ id: string; status: string }, string>({
      query: (id) => ({ url: `/admin/notifications/${id}/cancel`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Notifications', id },
        'Notifications',
        'NotificationMetrics',
      ],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminLogoutMutation,
  useGetMetricsQuery,
  useGetSitesQuery,
  useGetSiteDetailQuery,
  useGetSiteDashboardQuery,
  useGetSiteSessionsQuery,
  useGetSiteSessionDetailQuery,
  useGetSiteLeadsQuery,
  useGetSiteCrawlsQuery,
  useGetSiteEventsQuery,
  useGetSessionsQuery,
  useGetMessagesQuery,
  useGetSessionMessagesQuery,
  useGetLeadsQuery,
  useGetCrawlsQuery,
  useGetEventsQuery,
  useGetCustomersHealthQuery,
  useGetCustomerDetailQuery,
  useGetNotificationTemplatesQuery,
  usePreviewNotificationTemplateQuery,
  useGetNotificationsQuery,
  useGetNotificationDetailQuery,
  useGetNotificationMetricsQuery,
  useGetNotificationsQueueHealthQuery,
  useRetryNotificationMutation,
  useCancelNotificationMutation,
} = adminApi;
