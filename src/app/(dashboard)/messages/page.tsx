'use client';

import { useGetMessagesQuery } from "@/redux/api/adminApi";

export default function MessagesPage() {
  const { data, isLoading, error } = useGetMessagesQuery();

  if (isLoading) return <div className="p-8 text-gray-500">Loading messages...</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load messages.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Messages</h2>
      <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.messages?.map((msg: any) => (
              <tr key={msg.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${msg.role === 'assistant' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-[400px] truncate">{msg.content}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[150px]">{msg.session?.sessionToken}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{msg.intentDetected || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(msg.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
