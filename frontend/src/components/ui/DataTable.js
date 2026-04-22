import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';
export function DataTable({ columns, rows, loading, empty, rowKey, onRowClick, toolbar, initialPageSize = 10, searchPlaceholder = 'Поиск', searchAccessor }) {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const visibleCols = columns.filter((c) => !c.hidden);
    const filtered = useMemo(() => {
        if (!query)
            return rows;
        const q = query.toLowerCase();
        return rows.filter((r) => (searchAccessor ? searchAccessor(r).toLowerCase().includes(q) : true));
    }, [rows, query, searchAccessor]);
    const sorted = useMemo(() => {
        if (!sort)
            return filtered;
        const col = columns.find((c) => c.key === sort.key);
        if (!col?.sortValue)
            return filtered;
        return [...filtered].sort((a, b) => {
            const va = col.sortValue(a);
            const vb = col.sortValue(b);
            if (va < vb)
                return sort.dir === 'asc' ? -1 : 1;
            if (va > vb)
                return sort.dir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sort, columns]);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(page, totalPages);
    const paged = sorted.slice((current - 1) * pageSize, current * pageSize);
    const toggleSort = (key) => {
        setSort((s) => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }));
    };
    return (_jsxs("div", { className: "glass elevated rounded-2xl overflow-hidden flex flex-col", children: [_jsxs("div", { className: "p-4 flex flex-wrap items-center gap-3 hairline-b", children: [_jsxs("div", { className: "relative flex-1 min-w-[220px] max-w-md", children: [_jsx(SearchIcon, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" }), _jsx("input", { value: query, onChange: (e) => {
                                    setQuery(e.target.value);
                                    setPage(1);
                                }, placeholder: searchPlaceholder, className: "w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm focus:outline-none focus:border-white/15" })] }), _jsx("div", { className: "flex-1" }), toolbar] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-[13px]", children: [_jsx("thead", { className: "text-[11px] uppercase tracking-[0.18em] text-neutral-500", children: _jsx("tr", { className: "hairline-b", children: visibleCols.map((c) => (_jsx("th", { className: cn('px-4 py-3 text-left font-medium whitespace-nowrap', c.className), style: { width: c.width }, children: c.sortable !== false && c.sortValue ? (_jsxs("button", { onClick: () => toggleSort(c.key), className: "inline-flex items-center gap-1.5 hover:text-neutral-200", children: [c.header, sort?.key === c.key ? (sort.dir === 'asc' ? (_jsx(ArrowUp, { size: 11 })) : (_jsx(ArrowDown, { size: 11 }))) : (_jsx(ArrowUpDown, { size: 11, className: "opacity-40" }))] })) : (c.header) }, c.key))) }) }), _jsxs("tbody", { children: [loading &&
                                    Array.from({ length: 6 }).map((_, i) => (_jsx("tr", { className: "hairline-b", children: visibleCols.map((c) => (_jsx("td", { className: "px-4 py-3", children: _jsx(Skeleton, { className: "h-3.5" }) }, c.key))) }, i))), !loading && paged.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: visibleCols.length, className: "px-4 py-16 text-center text-neutral-500", children: empty ?? 'Ничего не найдено' }) })), !loading &&
                                    paged.map((row) => (_jsx("tr", { onClick: () => onRowClick?.(row), className: cn('hairline-b transition hover:bg-white/[0.025]', onRowClick && 'cursor-pointer'), children: visibleCols.map((c) => (_jsx("td", { className: cn('px-4 py-3 text-neutral-200', c.className), children: c.accessor(row) }, c.key))) }, rowKey(row))))] })] }) }), _jsxs("div", { className: "p-4 flex flex-wrap items-center gap-3 hairline-t text-[12px] text-neutral-400", children: [_jsxs("span", { children: [total, " ", (['студент', 'студента', 'студентов'][0] && 'строк')] }), _jsx("div", { className: "flex-1" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: "\u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435:" }), _jsx("select", { value: pageSize, onChange: (e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }, className: "bg-white/[0.03] border border-white/[0.08] rounded-md px-2 py-1 text-neutral-200 focus:outline-none", children: [10, 25, 50, 100].map((s) => (_jsx("option", { value: s, children: s }, s))) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: current === 1, className: "h-7 px-2 rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-40", children: "\u2039" }), _jsxs("span", { children: [current, " / ", totalPages] }), _jsx("button", { onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: current === totalPages, className: "h-7 px-2 rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-40", children: "\u203A" })] })] })] }));
}
