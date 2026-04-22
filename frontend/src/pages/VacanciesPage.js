import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, Building2, MapPin, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
function appStatusTone(s) {
    switch (s) {
        case 'Accepted':
            return 'success';
        case 'Offered':
            return 'gold';
        case 'Interview':
            return 'brand';
        case 'Rejected':
        case 'Withdrawn':
            return 'danger';
        default:
            return 'neutral';
    }
}
export default function VacanciesPage() {
    const { t } = useTranslation();
    const [activeId, setActiveId] = useState(null);
    const [filter, setFilter] = useState('all');
    const list = useQuery({
        queryKey: ['vacancies', filter],
        queryFn: async () => (await api.get('/vacancies', {
            params: {
                page: 1,
                pageSize: 50,
                internship: filter === 'all' ? undefined : filter === 'internship'
            }
        })).data
    });
    const detail = useQuery({
        queryKey: ['vacancy', activeId],
        enabled: !!activeId,
        queryFn: async () => (await api.get(`/vacancies/${activeId}`)).data
    });
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { title: t('vacancies.title'), subtitle: t('vacancies.subtitle'), actions: _jsx("div", { className: "flex items-center gap-1 p-1 rounded-xl glass", children: ['all', 'internship', 'fulltime'].map((f) => (_jsx("button", { onClick: () => setFilter(f), className: cn('h-8 px-3 rounded-lg text-[12.5px] font-medium transition', filter === f ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-neutral-200'), children: f === 'all' ? 'Все' : f === 'internship' ? t('vacancies.internship') : 'Постоянная' }, f))) }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-4", children: [_jsxs("div", { className: "flex flex-col gap-3", children: [list.isLoading &&
                                Array.from({ length: 5 }).map((_, i) => (_jsxs(Card, { children: [_jsx(Skeleton, { className: "h-5 w-48 mb-3" }), _jsx(Skeleton, { className: "h-3 w-36" })] }, i))), list.data?.items.map((v) => (_jsxs(motion.button, { onClick: () => setActiveId(v.id), whileHover: { y: -2 }, className: cn('text-left glass glass-hover rounded-2xl p-4 transition', activeId === v.id && 'border-brand-500/40 shadow-glow'), children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-[15px] font-medium text-white", children: v.title }), _jsxs("div", { className: "flex items-center gap-2 text-[12px] text-neutral-400 mt-1", children: [_jsx(Building2, { size: 12 }), " ", v.company] }), _jsxs("div", { className: "flex items-center gap-2 text-[12px] text-neutral-400 mt-1", children: [_jsx(MapPin, { size: 12 }), " ", v.location || '—'] })] }), v.isInternship && _jsx(Badge, { tone: "brand", children: t('vacancies.internship') })] }), _jsxs("div", { className: "flex items-center justify-between mt-3 text-[12px]", children: [_jsx("span", { className: "text-[#d4af6a]", children: v.salaryMin ? `${fmtCurrency(v.salaryMin)} — ${fmtCurrency(v.salaryMax ?? v.salaryMin)}` : '—' }), _jsxs("span", { className: "flex items-center gap-1 text-neutral-500", children: [_jsx(Users, { size: 12 }), " ", v.applications] })] })] }, v.id))), list.data && list.data.items.length === 0 && (_jsx(Card, { children: _jsx("div", { className: "text-center text-neutral-500 py-8", children: t('common.noResults') }) }))] }), _jsxs(Card, { className: "min-h-[420px]", children: [!activeId && (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center py-20 text-neutral-500", children: [_jsx(Briefcase, { size: 36, className: "mb-3 opacity-50" }), _jsx("div", { children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0430\u043A\u0430\u043D\u0441\u0438\u044E \u0441\u043B\u0435\u0432\u0430, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u043E\u0442\u043A\u043B\u0438\u043A\u043E\u0432 \u0438 AI-\u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u044F" })] })), activeId && detail.isLoading && _jsx(Skeleton, { className: "h-[400px]" }), detail.data && (_jsxs("div", { className: "flex flex-col gap-5", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-display text-[24px] tracking-tight text-white", children: detail.data.summary.title }), _jsxs("div", { className: "flex items-center gap-3 text-[13px] text-neutral-400 mt-1", children: [_jsxs("span", { className: "inline-flex items-center gap-1.5", children: [_jsx(Building2, { size: 12 }), detail.data.summary.company] }), _jsxs("span", { className: "inline-flex items-center gap-1.5", children: [_jsx(MapPin, { size: 12 }), detail.data.summary.location || '—'] }), _jsxs("span", { className: "inline-flex items-center gap-1.5", children: [_jsx(Users, { size: 12 }), detail.data.summary.applications, " \u043E\u0442\u043A\u043B\u0438\u043A\u043E\u0432"] })] })] }), _jsx(Badge, { tone: detail.data.summary.isInternship ? 'brand' : 'gold', children: detail.data.summary.isInternship ? t('vacancies.internship') : 'Постоянная' })] }), detail.data.description && (_jsx("p", { className: "text-[13.5px] text-neutral-300 mt-4 leading-relaxed whitespace-pre-line", children: detail.data.description })), detail.data.requirements && (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2", children: "\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: detail.data.requirements
                                                            .split(/[,;•]/)
                                                            .map((s) => s.trim())
                                                            .filter(Boolean)
                                                            .map((s, i) => (_jsx(Badge, { tone: "neutral", children: s }, i))) })] })), detail.data.benefits && (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2", children: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F" }), _jsx("div", { className: "text-[13px] text-neutral-300", children: detail.data.benefits })] }))] }), _jsxs("div", { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('vacancies.applications') }) }), _jsxs("div", { className: "flex flex-col divide-y divide-white/5", children: [detail.data.applicationsList.length === 0 && (_jsx("div", { className: "py-8 text-center text-neutral-500", children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043E\u0442\u043A\u043B\u0438\u043A\u043E\u0432" })), detail.data.applicationsList.map((a) => (_jsxs("div", { className: "py-3 flex items-center gap-3", children: [_jsx("div", { className: "size-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[11px] font-semibold", children: a.applicant
                                                                    .split(' ')
                                                                    .slice(0, 2)
                                                                    .map((p) => p[0])
                                                                    .join('') }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-neutral-100 text-[13.5px]", children: a.applicant }), _jsx("div", { className: "text-[11.5px] text-neutral-500", children: a.email ?? '' }), a.aiSummary && (_jsx("div", { className: "text-[11px] text-neutral-500 mt-1 italic", children: a.aiSummary }))] }), _jsxs("div", { className: "flex flex-col items-end gap-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-24 h-1.5 rounded-full bg-white/5 overflow-hidden", children: _jsx("div", { className: "h-full", style: {
                                                                                        width: `${Math.round(a.aiMatchScore * 100)}%`,
                                                                                        background: a.aiMatchScore > 0.75 ? '#10b981' : a.aiMatchScore > 0.5 ? '#d4af6a' : '#5350ff'
                                                                                    } }) }), _jsxs("span", { className: "text-[11px] text-neutral-400 font-mono", children: [Math.round(a.aiMatchScore * 100), "%"] })] }), _jsx(Badge, { tone: appStatusTone(a.status), children: a.status })] }), _jsx("div", { className: "text-[11px] text-neutral-500 w-24 text-right", children: fmtDate(a.createdAt) })] }, a.id)))] })] })] }))] })] })] }));
}
