'use client';

import { useGetMetricsQuery } from '@/redux/api/adminApi';
import { PlatformKpiCard } from '@/components/dashboard/PlatformKpiCard';
import { PlatformTrendChart } from '@/components/dashboard/PlatformTrendChart';
import { PlatformGrowthSummary } from '@/components/dashboard/PlatformGrowthSummary';
import {
  LiveSitesPanel,
  RecentSignupsPanel,
  TopSitesPanel,
} from '@/components/dashboard/PlatformInsightPanels';
import { Users, Globe, Briefcase, Activity, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading, error } = useGetMetricsQuery();

  if (isLoading) return <div className="p-8 text-gray-500">Loading metrics...</div>;
  if (error || !data) return <div className="p-8 text-red-500">Failed to load metrics.</div>;

  const { totals, growth, windows, timeline } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Platform Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            All-time totals with rolling weekly and monthly growth
          </p>
        </div>
        {data.generatedAt && (
          <p className="text-xs text-gray-400">
            Updated {new Date(data.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PlatformKpiCard
          title="Total Users"
          value={totals.users}
          wow={growth.week.users}
          mom={growth.month.users}
          icon={<Users className="h-5 w-5 text-blue-600" />}
        />
        <PlatformKpiCard
          title="Total Sites"
          value={totals.sites}
          wow={growth.week.sites}
          mom={growth.month.sites}
          icon={<Globe className="h-5 w-5 text-indigo-600" />}
        />
        <PlatformKpiCard
          title="Total Leads"
          value={totals.leads}
          wow={growth.week.leads}
          mom={growth.month.leads}
          hero
          icon={<Briefcase className="h-5 w-5 text-white/80" />}
        />
        <PlatformKpiCard
          title="Total Sessions"
          value={totals.sessions}
          wow={growth.week.sessions}
          mom={growth.month.sessions}
          icon={<Activity className="h-5 w-5 text-purple-600" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PlatformKpiCard
          title="Total Messages"
          value={totals.messages}
          wow={growth.week.messages}
          mom={growth.month.messages}
          icon={<MessageSquare className="h-5 w-5 text-pink-600" />}
        />
        <PlatformKpiCard
          title="Widget Events"
          value={totals.events}
          wow={growth.week.events}
          mom={growth.month.events}
          icon={<Activity className="h-5 w-5 text-rose-600" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Platform activity — last 30 days</h3>
          <p className="text-xs text-gray-500">Sessions, leads, and new signups per day</p>
          <div className="mt-4">
            <PlatformTrendChart
              labels={timeline.labels}
              leads={timeline.leads}
              sessions={timeline.sessions}
              users={timeline.users}
            />
          </div>
        </div>
        <div className="space-y-4">
          <LiveSitesPanel totals={totals} />
          <RecentSignupsPanel signups={data.recentSignups} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlatformGrowthSummary week={windows.week} prevWeek={windows.prevWeek} />
        <TopSitesPanel sites={data.topSitesThisMonth} />
      </div>
    </div>
  );
}
