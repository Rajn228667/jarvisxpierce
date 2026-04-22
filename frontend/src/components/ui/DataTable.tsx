import { ReactNode, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  hidden?: boolean;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: ReactNode;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  initialPageSize?: number;
  searchPlaceholder?: string;
  searchAccessor?: (row: T) => string;
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  empty,
  rowKey,
  onRowClick,
  toolbar,
  initialPageSize = 10,
  searchPlaceholder = 'Поиск',
  searchAccessor
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const visibleCols = columns.filter((c) => !c.hidden);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => (searchAccessor ? searchAccessor(r).toLowerCase().includes(q) : true));
  }, [rows, query, searchAccessor]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sort, columns]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const paged = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key: string) => {
    setSort((s) => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }));
  };

  return (
    <div className="glass elevated rounded-2xl overflow-hidden flex flex-col">
      <div className="p-4 flex flex-wrap items-center gap-3 hairline-b">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm focus:outline-none focus:border-white/15"
          />
        </div>
        <div className="flex-1" />
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            <tr className="hairline-b">
              {visibleCols.map((c) => (
                <th
                  key={c.key}
                  className={cn('px-4 py-3 text-left font-medium whitespace-nowrap', c.className)}
                  style={{ width: c.width }}
                >
                  {c.sortable !== false && c.sortValue ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1.5 hover:text-neutral-200"
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === 'asc' ? (
                          <ArrowUp size={11} />
                        ) : (
                          <ArrowDown size={11} />
                        )
                      ) : (
                        <ArrowUpDown size={11} className="opacity-40" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="hairline-b">
                  {visibleCols.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      <Skeleton className="h-3.5" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading && paged.length === 0 && (
              <tr>
                <td colSpan={visibleCols.length} className="px-4 py-16 text-center text-neutral-500">
                  {empty ?? 'Ничего не найдено'}
                </td>
              </tr>
            )}
            {!loading &&
              paged.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'hairline-b transition hover:bg-white/[0.025]',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {visibleCols.map((c) => (
                    <td key={c.key} className={cn('px-4 py-3 text-neutral-200', c.className)}>
                      {c.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex flex-wrap items-center gap-3 hairline-t text-[12px] text-neutral-400">
        <span>
          {total} {(['студент', 'студента', 'студентов'][0] && 'строк')}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span>на странице:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-md px-2 py-1 text-neutral-200 focus:outline-none"
          >
            {[10, 25, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={current === 1}
            className="h-7 px-2 rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-40"
          >
            ‹
          </button>
          <span>
            {current} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={current === totalPages}
            className="h-7 px-2 rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
