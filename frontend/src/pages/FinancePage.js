import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Wallet, Receipt, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api, extractError } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/utils';
const PIE_COLORS = ['#5350ff', '#d4af6a', '#10b981', '#ef4444', '#f59e0b'];
function statusTone(s) {
    switch (s) {
        case 'Paid':
            return 'success';
        case 'Partial':
            return 'gold';
        case 'Overdue':
            return 'danger';
        case 'Cancelled':
            return 'neutral';
        default:
            return 'brand';
    }
}
export default function FinancePage() {
    const { t } = useTranslation();
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('');
    const overview = useQuery({
        queryKey: ['finance-overview'],
        queryFn: async () => (await api.get('/finance/overview')).data
    });
    const invoices = useQuery({
        queryKey: ['finance-invoices', statusFilter],
        queryFn: async () => (await api.get('/finance/invoices', { params: { page: 1, pageSize: 500, status: statusFilter || undefined } }))
            .data
    });
    const payMut = useMutation({
        mutationFn: async (inv) => {
            const remaining = Math.max(0, Number(inv.amount) - Number(inv.paidAmount));
            return (await api.post(`/finance/invoices/${inv.id}/pay`, { amount: remaining, method: 'card' })).data;
        },
        onSuccess: () => {
            toast.success('Оплата проведена');
            qc.invalidateQueries({ queryKey: ['finance-invoices'] });
            qc.invalidateQueries({ queryKey: ['finance-overview'] });
            qc.invalidateQueries({ queryKey: ['dash-overview'] });
        },
        onError: (e) => toast.error(extractError(e))
    });
    const columns = [
        { key: 'number', header: '№', accessor: (r) => _jsx("span", { className: "font-mono text-neutral-300", children: r.number }), sortValue: (r) => r.number },
        { key: 'student', header: 'Студент', accessor: (r) => (_jsxs("div", { children: [_jsx("div", { className: "text-neutral-100", children: r.studentName }), _jsx("div", { className: "text-[11px] text-neutral-500", children: r.studentNumber })] })), sortValue: (r) => r.studentName },
        { key: 'type', header: 'Тип', accessor: (r) => _jsx(Badge, { tone: "neutral", children: r.type }) },
        {
            key: 'amount',
            header: 'Сумма',
            accessor: (r) => fmtCurrency(r.amount),
            sortValue: (r) => r.amount
        },
        {
            key: 'paid',
            header: 'Оплачено',
            accessor: (r) => _jsx("span", { className: r.paidAmount > 0 ? 'text-emerald-300' : 'text-neutral-500', children: fmtCurrency(r.paidAmount) }),
            sortValue: (r) => r.paidAmount
        },
        {
            key: 'due',
            header: 'Срок',
            accessor: (r) => _jsx("span", { className: "text-neutral-400", children: fmtDate(r.dueAt) }),
            sortValue: (r) => r.dueAt
        },
        {
            key: 'status',
            header: t('common.status'),
            accessor: (r) => _jsx(Badge, { tone: statusTone(r.status), children: r.status }),
            sortValue: (r) => r.status
        },
        {
            key: 'actions',
            header: '',
            accessor: (r) => r.status !== 'Paid' && r.status !== 'Cancelled' ? (_jsx(Button, { size: "sm", variant: "subtle", loading: payMut.isPending && payMut.variables?.id === r.id, onClick: () => payMut.mutate(r), children: t('finance.pay') })) : (_jsx("span", { className: "text-neutral-600 text-xs", children: "\u2014" }))
        }
    ];
    const exportCsv = async () => {
        try {
            const res = await api.get('/finance/invoices/export.csv', { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoices_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
        catch {
            toast.error('Не удалось экспортировать');
        }
    };
    const ov = overview.data;
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { title: t('finance.title'), subtitle: t('finance.subtitle'), actions: _jsxs(Button, { variant: "subtle", size: "sm", onClick: exportCsv, children: [_jsx(Download, { size: 14 }), " CSV"] }) }), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(KpiCard, { icon: _jsx(Receipt, { size: 16 }), label: t('finance.invoiced'), value: fmtCurrency(ov?.totalInvoiced), tone: "brand" }), _jsx(KpiCard, { icon: _jsx(CheckCircle2, { size: 16 }), label: t('finance.paid'), value: fmtCurrency(ov?.totalPaid), tone: "success" }), _jsx(KpiCard, { icon: _jsx(Wallet, { size: 16 }), label: t('finance.debt'), value: fmtCurrency(ov?.totalDebt), tone: "gold" }), _jsx(KpiCard, { icon: _jsx(AlertTriangle, { size: 16 }), label: t('finance.overdue'), value: fmtNumber(ov?.overdueCount ?? 0), tone: "danger" })] }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "xl:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('finance.monthlyFlow') }) }), _jsx("div", { className: "h-[250px]", children: ov?.monthlyFlow && (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: ov.monthlyFlow, children: [_jsx(CartesianGrid, { stroke: "#ffffff10", vertical: false }), _jsx(XAxis, { dataKey: "month", stroke: "#737373", fontSize: 11 }), _jsx(YAxis, { stroke: "#737373", fontSize: 11, tickFormatter: (v) => fmtNumber(v) }), _jsx(Tooltip, { contentStyle: { background: '#15151a', border: '1px solid #ffffff10', borderRadius: 10 }, formatter: (v) => fmtCurrency(v) }), _jsx(Bar, { dataKey: "total", fill: "#5350ff", radius: [6, 6, 0, 0], name: "\u041E\u043F\u043B\u0430\u0447\u0435\u043D\u043E" })] }) })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: t('finance.byType') }) }), _jsx("div", { className: "h-[250px]", children: ov?.byType && (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: ov.byType, dataKey: "total", nameKey: "type", innerRadius: 55, outerRadius: 95, paddingAngle: 2, stroke: "#0a0a0b", children: ov.byType.map((_, i) => (_jsx(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i))) }), _jsx(Tooltip, { contentStyle: { background: '#15151a', border: '1px solid #ffffff10', borderRadius: 10 }, formatter: (v) => fmtCurrency(v) })] }) })) })] })] }), _jsx("div", { className: "flex items-center gap-3", children: _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 text-sm text-neutral-200 focus:outline-none focus:border-white/15", children: [_jsx("option", { value: "", children: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B" }), _jsx("option", { value: "Draft", children: "\u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A" }), _jsx("option", { value: "Issued", children: "\u0412\u044B\u0441\u0442\u0430\u0432\u043B\u0435\u043D" }), _jsx("option", { value: "Paid", children: "\u041E\u043F\u043B\u0430\u0447\u0435\u043D" }), _jsx("option", { value: "Partial", children: "\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E" }), _jsx("option", { value: "Overdue", children: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D" })] }) }), _jsx(DataTable, { columns: columns, rows: invoices.data?.items ?? [], loading: invoices.isLoading, rowKey: (r) => r.id, searchAccessor: (r) => `${r.number} ${r.studentName} ${r.studentNumber} ${r.type}`, searchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043D\u043E\u043C\u0435\u0440\u0443, \u0441\u0442\u0443\u0434\u0435\u043D\u0442\u0443, \u0442\u0438\u043F\u0443" })] }));
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
