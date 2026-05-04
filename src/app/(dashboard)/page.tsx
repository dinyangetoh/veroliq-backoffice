'use client';

import { useGetMetricsQuery } from "@/redux/api/adminApi";
import { Users, Globe, Briefcase, MessageSquare, Activity, Bug } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, error } = useGetMetricsQuery();

  if (isLoading) return <div className="p-8 text-gray-500">Loading metrics...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load metrics.</div>;

  const metrics = [
    { title: "Total Users", value: data?.users || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Sites", value: data?.sites || 0, icon: Globe, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "Total Leads", value: data?.leads || 0, icon: Briefcase, color: "text-green-600", bg: "bg-green-100" },
    { title: "Total Sessions", value: data?.sessions || 0, icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Total Messages", value: data?.messages || 0, icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-100" },
    { title: "Crawl Jobs", value: data?.crawls || 0, icon: Bug, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Widget Events", value: data?.events || 0, icon: Activity, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Platform Overview</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${metric.bg}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 truncate">{metric.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{metric.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
