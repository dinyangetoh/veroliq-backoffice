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

type SiteTrendChartProps = {
  labels: string[];
  chats: number[];
  leads: number[];
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

export function SiteTrendChart({ labels, chats, leads }: SiteTrendChartProps) {
  const data = labels.map((label, i) => ({
    label,
    chats: chats[i] ?? 0,
    leads: leads[i] ?? 0,
  }));

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val, i) => (i % 4 === 0 ? formatLabel(String(val)) : '')}
          />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={32} />
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
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="chats" name="Chats" stroke="#6366f1" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="leads" name="Leads" stroke="#16a34a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
