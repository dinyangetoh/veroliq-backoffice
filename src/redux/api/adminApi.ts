import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_VEROLIQ_API_URL || 'http://localhost:3001',
    // The admin endpoints are protected by Basic auth or another mechanism?
    // The plan said: "use static credential configurable as environment variable"
    // Wait, the API uses AdminBasicAuthGuard. We need to pass the basic auth header.
    // The credentials can be passed from the Next.js server to the client or the client can fetch them.
    // Actually, in the frontend we could just use a generic Authorization header.
    // If the frontend does client-side fetching, it needs the credentials.
    // For now, let's assume we proxy it through a Next.js API route or just use the password directly.
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        headers.set('Authorization', `Basic ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Admin', 'Sites', 'Sessions', 'Messages', 'Leads', 'Crawls', 'Events', 'Customers'],
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetMetricsQuery,
  useGetSitesQuery,
  useGetSessionsQuery,
  useGetMessagesQuery,
  useGetLeadsQuery,
  useGetCrawlsQuery,
  useGetEventsQuery,
  useGetCustomersHealthQuery,
  useGetCustomerDetailQuery,
} = adminApi;
