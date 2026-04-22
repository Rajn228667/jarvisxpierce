import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Search, Flag, Ban } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api, extractError } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtDate, fmtNumber } from '@/lib/utils';
const PIE_COLORS = ['#5350ff', '#d4af6a', '#10b981', '#ef4444', '#f59e0b', '#6b7280', '#06b6d4', '#ec4899'];
function riskTone(level) {
    switch (level) {
        case 'Critical':
            return 'danger';
        case 'High':
            return 'warn';
        case 'Medium':
            return 'gold';
        case 'Low':
            return 'success';
        default:
            return 'neutral';
    }
}
export default function SecurityPage() {
    const { t } = useTranslation();
    const qc = useQueryClient();
    const [urlInput, setUrlInput] = useState('');
    const [lastScan, setLastScan] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const overview = useQuery({
        queryKey: ['sec-overview'],
        queryFn: async () => (await api.get('/security/overview')).data
    });
    const domains = useQuery({
        queryKey: ['sec-domains', categoryFilter],
        queryFn: async () => (await api.get('/security/domains', {
            params: { page: 1, pageSize: 500, category: categoryFilter || undefined }
        })).data
    });
    const cases = useQuery({
        queryKey: ['sec-cases'],
        queryFn: async () => (await api.get('/security/cases', { params: { page: 1, pageSize: 50 } })).data
    });
    const scan = useMutation({
        mutationFn: async (u) => (await api.post('/security/domains/scan', { url: u })).data,
        onSuccess: (data) => {
            setLastScan(data);
            toast.success(`Домен проверен: риск ${Math.round(data.riskScore)}/100`);
            qc.invalidateQueries({ queryKey: ['sec-domains'] });
            qc.invalidateQueries({ queryKey: ['sec-overview'] });
        },
        onError: (e) => toast.error(extractError(e))
    });
    const toggleBlack = useMutation({
        mutationFn: async (id) => (await api.post(`/security/domains/${id}/blacklist`)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sec-domains'] });
            qc.invalidateQueries({ queryKey: ['sec-overview'] });
            toast.success('Статус обновлён');
        },
        onError: (e) => toast.error(extractError(e))
    });
    const createCase = useMutation({
        mutationFn: async (id) => (await api.post(`/security/domains/${id}/case`)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sec-cases'] });
            toast.success('Расследование открыто');
        },
        onError: (e) => toast.error(extractError(e))
    });
    const onScan = (e) => {
        e.preventDefault();
        const d = urlInput.trim();
        if (!d)
            return;
        scan.mutate(d);
    };
    const columns = [
        {
            key: 'domain',
            header: 'Домен',
            accessor: (r) => (_jsxs("div", { children: [_jsx("div", { className: "text-neutral-100 font-mono", children: r.host ?? r.url }), _jsx("div", { className: "text-[11px] text-neutral-500", children: r.lastCheckedAt ? fmtDate(r.lastCheckedAt, true) : '—' })] })),
            sortValue: (r) => r.host ?? r.url
        },
        {
            key: 'category',
            header: 'Категория',
            accessor: (r) => _jsx(Badge, { tone: "neutral", children: r.category }),
            sortValue: (r) => r.category
        },
        {
            key: 'risk',
            header: 'Риск',
            accessor: (r) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-20 h-1.5 rounded-full bg-white/5 overflow-hidden", children: _jsx("div", { className: "h-full", style: {
                                width: `${r.riskScore}%`,
                                background: r.riskScore > 75
                                    ? '#ef4444'
                                    : r.riskScore > 50
                                        ? '#f59e0b'
                                        : r.riskScore > 25
                                            ? '#d4af6a'
                                            : '#10b981'
                            } }) }), _jsx(Badge, { tone: riskTone(r.risk), children: Math.round(r.riskScore) })] })),
            sortValue: (r) => r.riskScore
        },
        {
            key: 'black',
            header: 'Чёрный список',
            accessor: (r) => r.isBlacklisted ? _jsx(Badge, { tone: "danger", children: "\u0432 \u0447/\u0441" }) : _jsx(Badge, { tone: "neutral", children: "\u043D\u0435\u0442" }),
            sortValue: (r) => (r.isBlacklisted ? 1 : 0)
        },
        {
            key: 'reasons',
            header: 'Причины',
            accessor: (r) => (_jsx("span", { className: "text-[12px] text-neutral-400 line-clamp-2", children: r.reasons ?? '—' }))
        },
        {
            key: 'actions',
            header: '',
            accessor: (r) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsxs(Button, { size: "sm", variant: "ghost", onClick: () => toggleBlack.mutate(r.id), children: [_jsx(Ban, { size: 12 }), " ", r.isBlacklisted ? 'Снять' : 'В ч/с'] }), _jsxs(Button, { size: "sm", variant: "ghost", onClick: () => createCase.mutate(r.id), children: [_jsx(Flag, { size: 12 }), " \u041A\u0435\u0439\u0441"] })] }))
        }
    ];
    const ov = overview.data;
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { title: t('security.title'), subtitle: t('security.subtitle') }), _jsxs(Card, { className: "relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 pointer-events-none opacity-40 bg-radial-luxe" }), _jsxs("div", { className: "relative flex flex-col md:flex-row md:items-center gap-4", children: [_jsx("div", { className: "size-12 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-300", children: _jsx(ShieldAlert, { size: 20 }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-[14px] text-neutral-200 font-medium", children: "AI-\u0430\u043D\u0430\u043B\u0438\u0437\u0430\u0442\u043E\u0440 \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0440\u0435\u0441\u0443\u0440\u0441\u043E\u0432" }), _jsx("div", { className: "text-[12px] text-neutral-500", children: "Groq \u00B7 llama-3.3-70b \u00B7 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F (\u043A\u0430\u0437\u0438\u043D\u043E / \u0444\u0438\u0448\u0438\u043D\u0433 / \u043F\u0438\u0440\u0430\u043C\u0438\u0434\u0430 / \u043C\u043E\u0448\u0435\u043D\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u043E) \u00B7 \u0430\u0432\u0442\u043E-\u0432\u043D\u0435\u0441\u0435\u043D\u0438\u0435 \u0432 \u0447/\u0441 \u043F\u0440\u0438 \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u043C \u0440\u0438\u0441\u043A\u0435" })] }), _jsxs("form", { onSubmit: onScan, className: "flex items-center gap-2 w-full md:w-[520px]", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" }), _jsx("input", { value: urlInput, onChange: (e) => setUrlInput(e.target.value), placeholder: t('security.placeholder'), className: "w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm focus:outline-none focus:border-brand-500/60" })] }), _jsx(Button, { type: "submit", loading: scan.isPending, children: t('security.scan') })] })] }), lastScan && (_jsxs(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, className: "relative mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "font-mono text-neutral-100", children: lastScan.host ?? lastScan.url }), _jsx(Badge, { tone: riskTone(lastScan.risk), children: lastScan.risk }), _jsx(Badge, { tone: "neutral", children: lastScan.category }), lastScan.isBlacklisted && _jsx(Badge, { tone: "danger", children: "\u0430\u0432\u0442\u043E \u0432 \u0447/\u0441" })] }), _jsx("p", { className: "text-[13px] text-neutral-300 mt-2 leading-relaxed", children: lastScan.reasons || '—' }), _jsxs("div", { className: "text-[11px] uppercase tracking-[0.18em] text-neutral-500 mt-2", children: ["\u0420\u0438\u0441\u043A ", Math.round(lastScan.riskScore), "/100"] })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs(Button, { variant: "subtle", onClick: () => toggleBlack.mutate(lastScan.id), children: [_jsx(Ban, { size: 13 }), " ", lastScan.isBlacklisted ? 'Снять с ч/с' : 'В ч/с'] }), _jsxs(Button, { variant: "subtle", onClick: () => createCase.mutate(lastScan.id), children: [_jsx(Flag, { size: 13 }), " \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0440\u0430\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u043D\u0438\u0435"] })] })] }))] }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(KpiCard, { icon: _jsx(ShieldCheck, { size: 16 }), label: t('security.monitored'), value: fmtNumber(ov?.totalDomains ?? 0), tone: "brand" }), _jsx(KpiCard, { icon: _jsx(Ban, { size: 16 }), label: t('security.blacklisted'), value: fmtNumber(ov?.blacklisted ?? 0), tone: "danger" }), _jsx(KpiCard, { icon: _jsx(Flag, { size: 16 }), label: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u043A\u0435\u0439\u0441\u044B", value: fmtNumber(ov?.openCases ?? 0), tone: "gold" }), _jsx(KpiCard, { icon: _jsx(ShieldAlert, { size: 16 }), label: "\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0438\u0441\u043A", value: fmtNumber(ov?.critical ?? 0), tone: "danger" })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "xl:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('security.topRisky') }) }), _jsxs("div", { className: "flex flex-col divide-y divide-white/5", children: [ov?.topRisky?.slice(0, 8).map((d, i) => (_jsxs("div", { className: "py-2.5 flex items-center gap-3", children: [_jsx("span", { className: "font-mono text-[13px] text-neutral-100 flex-1 truncate", children: d.host ?? d.url }), _jsx(Badge, { tone: "neutral", children: d.category }), _jsx("div", { className: "w-28 h-1.5 rounded-full bg-white/5 overflow-hidden", children: _jsx("div", { className: "h-full", style: {
                                                        width: `${d.riskScore}%`,
                                                        background: d.riskScore > 75 ? '#ef4444' : d.riskScore > 50 ? '#f59e0b' : '#d4af6a'
                                                    } }) }), _jsx("span", { className: "text-[12px] font-mono text-neutral-300 w-10 text-right", children: Math.round(d.riskScore) })] }, i))), (!ov?.topRisky || ov.topRisky.length === 0) && (_jsx("div", { className: "py-8 text-center text-neutral-500", children: t('security.empty') }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('security.categories') }) }), _jsx("div", { className: "h-[240px]", children: ov?.byCategory && (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: ov.byCategory, dataKey: "count", nameKey: "category", innerRadius: 55, outerRadius: 90, paddingAngle: 2, stroke: "#0a0a0b", children: ov.byCategory.map((_, i) => (_jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i))) }), _jsx(Tooltip, { contentStyle: {
                                                    background: '#15151a',
                                                    border: '1px solid #ffffff10',
                                                    borderRadius: 10
                                                } })] }) })) })] })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs("select", { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), className: "h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 text-sm text-neutral-200 focus:outline-none focus:border-white/15", children: [_jsx("option", { value: "", children: "\u0412\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }), _jsx("option", { value: "Casino", children: "\u041A\u0430\u0437\u0438\u043D\u043E" }), _jsx("option", { value: "Phishing", children: "\u0424\u0438\u0448\u0438\u043D\u0433" }), _jsx("option", { value: "Pyramid", children: "\u041F\u0438\u0440\u0430\u043C\u0438\u0434\u0430" }), _jsx("option", { value: "Scam", children: "\u041C\u043E\u0448\u0435\u043D\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u043E" }), _jsx("option", { value: "GamblingAd", children: "\u0420\u0435\u043A\u043B\u0430\u043C\u0430 \u0430\u0437\u0430\u0440\u0442\u043D\u044B\u0445 \u0438\u0433\u0440" }), _jsx("option", { value: "TelegramSeller", children: "Telegram-\u043F\u0440\u043E\u0434\u0430\u0432\u0435\u0446" }), _jsx("option", { value: "CleanVerified", children: "\u0427\u0438\u0441\u0442\u044B\u0439" })] }) }), _jsx(DataTable, { columns: columns, rows: domains.data?.items ?? [], loading: domains.isLoading, rowKey: (r) => r.id, searchAccessor: (r) => `${r.url} ${r.host ?? ''} ${r.category}`, searchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0434\u043E\u043C\u0435\u043D\u0443" }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('security.cases') }) }), _jsxs("div", { className: "divide-y divide-white/5", children: [cases.data?.items?.length === 0 && (_jsx("div", { className: "py-6 text-center text-neutral-500", children: t('security.empty') })), cases.data?.items?.map((c) => (_jsxs("div", { className: "py-3 flex items-center gap-3", children: [_jsx(Badge, { tone: riskTone(c.risk), children: c.risk }), _jsx("span", { className: "font-mono text-[12px] text-neutral-400", children: c.code }), _jsx("span", { className: "text-[13.5px] text-neutral-100 flex-1 truncate", children: c.title }), _jsx(Badge, { tone: "neutral", children: c.status }), _jsx("span", { className: "text-[11px] text-neutral-500 w-28 text-right", children: fmtDate(c.createdAt, true) })] }, c.id)))] })] })] }));
}
function KpiCard({ icon, label, value, tone }) {
    const toneColor = {
        brand: 'text-brand-300 bg-brand-500/10 border-brand-500/20',
        success: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
        gold: 'text-[#d4af6a] bg-[#d4af6a]/10 border-[#d4af6a]/25',
        danger: 'text-red-300 bg-red-500/10 border-red-500/25'
    }[tone];
    return (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-center gap-3 text-[12px] uppercase tracking-[0.18em] text-neutral-400", children: [_jsx("span", { className: `size-8 rounded-lg border flex items-center justify-center ${toneColor}`, children: icon }), label] }), _jsx("div", { className: "mt-3 font-display text-[26px] tracking-tight text-white", children: value })] }));
}
