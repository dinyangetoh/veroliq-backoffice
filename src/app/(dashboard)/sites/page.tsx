'use client';

import { useGetSitesQuery } from "@/redux/api/adminApi";

export default function SitesPage() {
  const { data, isLoading, error } = useGetSitesQuery();

  if (isLoading) return <div className="p-8 text-gray-500">Loading sites...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load sites.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Sites</h2>
      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.sites?.map((site: any) => (
              <tr key={site.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{site.domain}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{site.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.user?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {site.verificationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(site.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
