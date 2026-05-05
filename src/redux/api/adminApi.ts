import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

const baseUrl =
  process.env.NEXT_PUBLIC_VEROLIQ_API_URL || 'http://localhost:3001';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
});

let refreshing: Promise<unknown> | null = null;

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/login')) return;
  const next = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.href = `/login?next=${next}`;
}

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const isAuthEndpoint =
      typeof args !== 'string' &&
      typeof args?.url === 'string' &&
      args.url.startsWith('/admin/auth/');
    if (!isAuthEndpoint) {
      if (!refreshing) {
        refreshing = rawBaseQuery(
          { url: '/admin/auth/refresh', method: 'POST' },
          api,
          extraOptions,
        ).finally(() => {
          refreshing = null;
        });
      }
      const refreshed = (await refreshing) as Awaited<ReturnType<typeof rawBaseQuery>>;
      if (refreshed.error) {
        redirectToLogin();
        return result;
      }
      result = await rawBaseQuery(args, api, extraOptions);
      if (result.error?.status === 401) {
        redirectToLogin();
      }
    }
  }
  return result;
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithAuth,
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
    adminRefresh: builder.mutation<
      { email: string; accessTokenExpiresIn: string },
      void
    >({
      query: () => ({ url: '/admin/auth/refresh', method: 'POST' }),
    }),
    getMetrics: builder.query<any, void>({
      query: () => '/admin/metrics',
      providesTags: ['Admin'],
    }),
    getSites: builder.query<any, void>({
      query: () => '/admin/sites',
      providesTags: ['Sites'],
    }),
    getSessions: builder.query<any, void>({
      query: () => '/admin/sessions',
      providesTags: ['Sessions'],
    }),
    getMessages: builder.query<any, void>({
      query: () => '/admin/messages',
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
  useAdminRefreshMutation,
  useGetMetricsQuery,
  useGetSitesQuery,
  useGetSessionsQuery,
  useGetMessagesQuery,
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
