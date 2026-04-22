import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtCurrency, fmtNumber, fmtPercent } from '@/lib/utils';
function riskLevel(score) {
    if (score >= 0.75)
        return { tone: 'danger', label: 'Critical' };
    if (score >= 0.5)
        return { tone: 'warn', label: 'High' };
    if (score >= 0.25)
        return { tone: 'gold', label: 'Medium' };
    if (score > 0)
        return { tone: 'success', label: 'Low' };
    return { tone: 'neutral', label: 'None' };
}
export default function StudentsPage() {
    const { t } = useTranslation();
    const { data, isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: async () => (await api.get('/students', {
            params: { page: 1, pageSize: 500 }
        })).data
    });
    const columns = useMemo(() => [
        {
            key: 'name',
            header: t('students.fields.name'),
            accessor: (r) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "size-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[11px] font-semibold", children: r.fullName
                            .split(' ')
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('') }), _jsxs("div", { children: [_jsx("div", { className: "text-neutral-100", children: r.fullName }), _jsxs("div", { className: "text-[11px] text-neutral-500", children: [r.studentNumber, " \u2022 ", r.email] })] })] })),
            sortValue: (r) => r.fullName
        },
        {
            key: 'major',
            header: t('students.fields.major'),
            accessor: (r) => _jsx("span", { className: "text-neutral-300", children: r.major ?? '—' }),
            sortValue: (r) => r.major ?? ''
        },
        {
            key: 'group',
            header: 'Группа',
            accessor: (r) => _jsx("span", { className: "text-neutral-400", children: r.group ?? '—' })
        },
        {
            key: 'year',
            header: t('students.fields.year'),
            accessor: (r) => _jsx("span", { children: r.enrollmentYear }),
            sortValue: (r) => r.enrollmentYear
        },
        {
            key: 'gpa',
            header: t('students.fields.gpa'),
            accessor: (r) => _jsx("span", { className: "font-mono text-neutral-100", children: r.gpa.toFixed(2) }),
            sortValue: (r) => r.gpa
        },
        {
            key: 'attendance',
            header: t('students.fields.attendance'),
            accessor: (r) => fmtPercent(r.attendanceRate / 100, 0),
            sortValue: (r) => r.attendanceRate
        },
        {
            key: 'debt',
            header: t('students.fields.debt'),
            accessor: (r) => (_jsx("span", { className: r.debtAmount > 0 ? 'text-amber-300' : 'text-neutral-400', children: fmtCurrency(r.debtAmount) })),
            sortValue: (r) => r.debtAmount
        },
        {
            key: 'risk',
            header: t('students.fields.risk'),
            accessor: (r) => {
                const lvl = riskLevel(r.dropoutRiskScore);
                return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-16 h-1.5 rounded-full bg-white/5 overflow-hidden", children: _jsx("div", { className: "h-full rounded-full", style: {
                                    width: `${Math.round(r.dropoutRiskScore * 100)}%`,
                                    background: r.dropoutRiskScore > 0.7
                                        ? '#ef4444'
                                        : r.dropoutRiskScore > 0.45
                                            ? '#f59e0b'
                                            : r.dropoutRiskScore > 0.25
                                                ? '#d4af6a'
                                                : '#10b981'
                                } }) }), _jsxs(Badge, { tone: lvl.tone, children: [Math.round(r.dropoutRiskScore * 100), "%"] })] }));
            },
            sortValue: (r) => r.dropoutRiskScore
        }
    ], [t]);
    const onExport = async () => {
        try {
            const res = await api.get('/students/export.csv', { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Экспорт готов');
        }
        catch {
            toast.error('Не удалось экспортировать');
        }
    };
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { title: t('students.title'), subtitle: t('students.subtitle'), actions: _jsxs(Button, { variant: "subtle", size: "sm", onClick: onExport, children: [_jsx(Download, { size: 14 }), " ", t('common.export')] }) }), _jsx(DataTable, { columns: columns, rows: data?.items ?? [], loading: isLoading, rowKey: (r) => r.id, searchAccessor: (r) => `${r.fullName} ${r.email} ${r.major ?? ''} ${r.studentNumber}`, searchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0438\u043C\u0435\u043D\u0438, \u043F\u043E\u0447\u0442\u0435, \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438" }), _jsxs("div", { className: "text-[12px] text-neutral-500", children: ["\u041D\u0430\u0439\u0434\u0435\u043D\u043E: ", _jsx("span", { className: "text-neutral-300", children: fmtNumber(data?.total ?? 0) })] })] }));
}
