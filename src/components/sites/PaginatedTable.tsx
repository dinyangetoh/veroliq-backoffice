'use client';

type PaginatedTableProps = {
  columns: Array<{ key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode }>;
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  emptyMessage?: string;
};

export function PaginatedTable({
  columns,
  rows,
  total,
  page,
  limit,
  onPageChange,
  onRowClick,
  emptyMessage = 'No records found.',
}: PaginatedTableProps) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={String(row.id ?? i)}
                  className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50'}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {total.toLocaleString()} total · page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-gray-200 px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
