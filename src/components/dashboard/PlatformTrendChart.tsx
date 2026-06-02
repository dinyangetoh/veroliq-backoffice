'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type PlatformTrendChartProps = {
  labels: string[];
  leads: number[];
  allSessions: number[];
  chatSessions: number[];
  users?: number[];
};

function formatLabel(label: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    return new Date(`${label}T12:00:00Z`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  }
  return label;
}

export function PlatformTrendChart({ labels, leads, allSessions, chatSessions, users }: PlatformTrendChartProps) {
  const data = labels.map((label, i) => ({
    label,
    leads: leads[i] ?? 0,
    allSessions: allSessions[i] ?? 0,
    chatSessions: chatSessions[i] ?? 0,
    users: users?.[i] ?? 0,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val, i) => (i % 5 === 0 ? formatLabel(String(val)) : '')}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-md">
                  <p className="mb-1 text-xs text-gray-500">{formatLabel(String(label))}</p>
                  {payload.map((entry) => (
                    <p key={String(entry.dataKey)} style={{ color: entry.color }} className="font-medium">
                      {entry.name}: {entry.value}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Line type="monotone" dataKey="allSessions" name="All Sessions" stroke="#6366f1" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="chatSessions" name="Chat Sessions" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="leads" name="Leads" stroke="#16a34a" strokeWidth={2} dot={false} />
          {users && (
            <Line type="monotone" dataKey="users" name="Signups" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
