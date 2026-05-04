'use client';

import { useGetCrawlsQuery } from "@/redux/api/adminApi";

export default function CrawlsPage() {
  const { data, isLoading, error } = useGetCrawlsQuery();

  if (isLoading) return <div className="p-8 text-gray-500">Loading crawls...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load crawls.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Crawls</h2>
      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pages Processed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.crawls?.map((crawl: any) => (
              <tr key={crawl.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crawl.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{crawl.site?.domain}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    crawl.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                    crawl.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {crawl.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crawl.pagesProcessed} / {crawl.pagesFound}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(crawl.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
