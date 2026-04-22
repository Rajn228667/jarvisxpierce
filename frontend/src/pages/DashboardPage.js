import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/utils';
import { motion } from 'framer-motion';
const PIE_COLORS = [
    '#5350ff',
    '#d4af6a',
    '#10b981',
    '#ef4444',
    '#f59e0b',
    '#6b7280',
    '#06b6d4',
    '#ec4899'
];
function formatValue(v, f) {
    switch (f) {
        case 'currency':
            return fmtCurrency(v);
        case 'percent':
            return `${v.toFixed(1)}%`;
        case 'number':
            return v.toFixed(2);
        default:
            return fmtNumber(v);
    }
}
export default function DashboardPage() {
    const { t } = useTranslation();
    const overview = useQuery({
        queryKey: ['dash-overview'],
        queryFn: async () => (await api.get('/dashboard/overview')).data
    });
    const trends = useQuery({
        queryKey: ['dash-trends'],
        queryFn: async () => (await api.get('/dashboard/trends')).data
    });
    const activity = useQuery({
        queryKey: ['dash-activity'],
        queryFn: async () => (await api.get('/dashboard/activity', { params: { take: 12 } })).data
    });
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { title: t('dashboard.title'), subtitle: t('dashboard.subtitle') }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4", children: [overview.isLoading &&
                        Array.from({ length: 8 }).map((_, i) => (_jsxs(Card, { children: [_jsx(Skeleton, { className: "h-3 w-20 mb-3" }), _jsx(Skeleton, { className: "h-7 w-32" })] }, i))), overview.data?.kpis?.map((k, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.03 }, children: _jsxs(Card, { children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx(CardTitle, { children: k.label }), _jsxs(Badge, { tone: k.trend === 'up' ? 'success' : 'danger', children: [k.trend === 'up' ? _jsx(ArrowUpRight, { size: 11 }) : _jsx(ArrowDownRight, { size: 11 }), Math.abs(k.delta).toFixed(1), "%"] })] }), _jsx("div", { className: "mt-2 font-display text-[28px] tracking-tight text-white", children: formatValue(k.value, k.format) })] }) }, k.key)))] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "xl:col-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: t('dashboard.payments30') }), _jsxs("div", { className: "flex items-center gap-1 text-[11px] text-emerald-400", children: [_jsx(TrendingUp, { size: 12 }), " +9.4%"] })] }), _jsx("div", { className: "h-[260px] -mx-2", children: trends.data?.paymentsSeries ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: trends.data.paymentsSeries, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "g1", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#5350ff", stopOpacity: 0.55 }), _jsx("stop", { offset: "100%", stopColor: "#5350ff", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { stroke: "#ffffff10", vertical: false }), _jsx(XAxis, { dataKey: "date", stroke: "#737373", fontSize: 11, tickFormatter: (d) => String(d).slice(5) }), _jsx(YAxis, { stroke: "#737373", fontSize: 11, tickFormatter: (v) => fmtNumber(v) }), _jsx(Tooltip, { contentStyle: {
                                                    background: '#15151a',
                                                    border: '1px solid #ffffff10',
                                                    borderRadius: 10
                                                }, formatter: (v) => fmtCurrency(v) }), _jsx(Area, { type: "monotone", dataKey: "total", stroke: "#7070ff", fill: "url(#g1)", strokeWidth: 2 })] }) })) : (_jsx(Skeleton, { className: "h-full" })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('dashboard.domainCats') }) }), _jsx("div", { className: "h-[260px]", children: trends.data?.domainCategories ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: trends.data.domainCategories, dataKey: "value", nameKey: "category", innerRadius: 55, outerRadius: 95, paddingAngle: 2, stroke: "#0a0a0b", children: trends.data.domainCategories.map((_, i) => (_jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i))) }), _jsx(Tooltip, { contentStyle: {
                                                    background: '#15151a',
                                                    border: '1px solid #ffffff10',
                                                    borderRadius: 10
                                                } })] }) })) : (_jsx(Skeleton, { className: "h-full" })) }), _jsx("div", { className: "mt-3 space-y-1.5 text-[12px]", children: trends.data?.domainCategories?.slice(0, 6).map((c, i) => (_jsxs("div", { className: "flex items-center justify-between text-neutral-400", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "size-2 rounded-full", style: { background: PIE_COLORS[i % PIE_COLORS.length] } }), _jsx("span", { children: c.category })] }), _jsx("span", { className: "text-neutral-200", children: c.value })] }, c.category))) })] })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "xl:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('dashboard.enrollment') }) }), _jsx("div", { className: "h-[230px]", children: trends.data?.enrollmentGroups ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: trends.data.enrollmentGroups, children: [_jsx(CartesianGrid, { stroke: "#ffffff10", vertical: false }), _jsx(XAxis, { dataKey: "year", stroke: "#737373", fontSize: 11 }), _jsx(YAxis, { stroke: "#737373", fontSize: 11 }), _jsx(Tooltip, { contentStyle: {
                                                    background: '#15151a',
                                                    border: '1px solid #ffffff10',
                                                    borderRadius: 10
                                                } }), _jsx(Bar, { dataKey: "count", fill: "#5350ff", radius: [6, 6, 0, 0] })] }) })) : (_jsx(Skeleton, { className: "h-full" })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('dashboard.dropoutDist') }) }), _jsx("div", { className: "h-[230px]", children: trends.data?.riskBuckets ? (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: trends.data.riskBuckets, children: [_jsx(CartesianGrid, { stroke: "#ffffff10", vertical: false }), _jsx(XAxis, { dataKey: "label", stroke: "#737373", fontSize: 11 }), _jsx(YAxis, { stroke: "#737373", fontSize: 11 }), _jsx(Tooltip, { contentStyle: {
                                                    background: '#15151a',
                                                    border: '1px solid #ffffff10',
                                                    borderRadius: 10
                                                } }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: "#d4af6a", strokeWidth: 2.5, dot: { fill: '#d4af6a', r: 3 } })] }) })) : (_jsx(Skeleton, { className: "h-full" })) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('dashboard.activity') }) }), _jsxs("div", { className: "divide-y divide-white/5", children: [activity.isLoading &&
                                Array.from({ length: 6 }).map((_, i) => _jsx(Skeleton, { className: "h-4 my-3" }, i)), activity.data?.map((a) => (_jsxs("div", { className: "py-3 flex items-start gap-3 text-[13px]", children: [_jsx("span", { className: "mt-1 size-1.5 rounded-full bg-brand-400" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "text-neutral-200", children: [_jsx("span", { className: "font-medium", children: a.actor ?? 'Система' }), ' ', _jsx("span", { className: "text-neutral-400", children: a.action }), ' ', _jsxs("span", { className: "text-neutral-500", children: ["\u00B7 ", a.entity ?? ''] })] }), a.details && (_jsx("div", { className: "text-neutral-500 text-[12px] truncate max-w-[720px]", children: a.details }))] }), _jsx("span", { className: "text-[11px] text-neutral-500 whitespace-nowrap", children: fmtDate(a.at, true) })] }, a.id)))] })] })] }));
}
