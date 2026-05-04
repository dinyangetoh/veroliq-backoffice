'use client';

import { useGetSessionsQuery } from "@/redux/api/adminApi";

export default function SessionsPage() {
  const { data, isLoading, error } = useGetSessionsQuery();

  if (isLoading) return <div className="p-8 text-gray-500">Loading sessions...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load sessions.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sessions</h2>
      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.sessions?.map((session: any) => (
              <tr key={session.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate max-w-[200px]">{session.sessionToken}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{session.site?.domain}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[200px]">{session.pageUrl}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.messageCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.startedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
