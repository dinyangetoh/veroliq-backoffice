'use client';

import { useGetLeadsQuery } from "@/redux/api/adminApi";

export default function LeadsPage() {
  const { data, isLoading, error } = useGetLeadsQuery();

  if (isLoading) return <div className="p-8 text-gray-500">Loading leads...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load leads.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Leads</h2>
      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Captured</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.leads?.map((lead: any) => (
              <tr key={lead.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{lead.site?.domain}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {lead.intentTag}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lead.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
