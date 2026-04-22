import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Download, Wallet, Receipt, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api, extractError } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/utils';

type Invoice = {
  id: string;
  number: string;
  studentName: string;
  studentNumber: string;
  type: string;
  status: string;
  amount: number;
  paidAmount: number;
  dueAt: string;
  issuedAt: string;
};

type ByTypeItem = { type: string; total: number; paid: number };
type MonthlyItem = { month: string; total: number };
type FinanceOverview = {
  totalInvoiced: number;
  totalPaid: number;
  totalDebt: number;
  overdueCount: number;
  pendingCount: number;
  byType: ByTypeItem[];
  monthlyFlow: MonthlyItem[];
};

const PIE_COLORS = ['#5350ff', '#d4af6a', '#10b981', '#ef4444', '#f59e0b'];

function statusTone(s: string) {
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
    queryFn: async () => (await api.get('/finance/overview')).data as FinanceOverview
  });
  const invoices = useQuery({
    queryKey: ['finance-invoices', statusFilter],
    queryFn: async () =>
      (await api.get('/finance/invoices', { params: { page: 1, pageSize: 500, status: statusFilter || undefined } }))
        .data as { items: Invoice[]; total: number }
  });

  const payMut = useMutation({
    mutationFn: async (inv: Invoice) => {
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

  const columns: Column<Invoice>[] = [
    { key: 'number', header: '№', accessor: (r) => <span className="font-mono text-neutral-300">{r.number}</span>, sortValue: (r) => r.number },
    { key: 'student', header: 'Студент', accessor: (r) => (
      <div>
        <div className="text-neutral-100">{r.studentName}</div>
        <div className="text-[11px] text-neutral-500">{r.studentNumber}</div>
      </div>
    ), sortValue: (r) => r.studentName },
    { key: 'type', header: 'Тип', accessor: (r) => <Badge tone="neutral">{r.type}</Badge> },
    {
      key: 'amount',
      header: 'Сумма',
      accessor: (r) => fmtCurrency(r.amount),
      sortValue: (r) => r.amount
    },
    {
      key: 'paid',
      header: 'Оплачено',
      accessor: (r) => <span className={r.paidAmount > 0 ? 'text-emerald-300' : 'text-neutral-500'}>{fmtCurrency(r.paidAmount)}</span>,
      sortValue: (r) => r.paidAmount
    },
    {
      key: 'due',
      header: 'Срок',
      accessor: (r) => <span className="text-neutral-400">{fmtDate(r.dueAt)}</span>,
      sortValue: (r) => r.dueAt
    },
    {
      key: 'status',
      header: t('common.status'),
      accessor: (r) => <Badge tone={statusTone(r.status) as 'success' | 'gold' | 'danger' | 'neutral' | 'brand'}>{r.status}</Badge>,
      sortValue: (r) => r.status
    },
    {
      key: 'actions',
      header: '',
      accessor: (r) =>
        r.status !== 'Paid' && r.status !== 'Cancelled' ? (
          <Button size="sm" variant="subtle" loading={payMut.isPending && payMut.variables?.id === r.id} onClick={() => payMut.mutate(r)}>
            {t('finance.pay')}
          </Button>
        ) : (
          <span className="text-neutral-600 text-xs">—</span>
        )
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
    } catch {
      toast.error('Не удалось экспортировать');
    }
  };

  const ov = overview.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('finance.title')}
        subtitle={t('finance.subtitle')}
        actions={
          <Button variant="subtle" size="sm" onClick={exportCsv}>
            <Download size={14} /> CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<Receipt size={16} />} label={t('finance.invoiced')} value={fmtCurrency(ov?.totalInvoiced)} tone="brand" />
        <KpiCard icon={<CheckCircle2 size={16} />} label={t('finance.paid')} value={fmtCurrency(ov?.totalPaid)} tone="success" />
        <KpiCard icon={<Wallet size={16} />} label={t('finance.debt')} value={fmtCurrency(ov?.totalDebt)} tone="gold" />
        <KpiCard icon={<AlertTriangle size={16} />} label={t('finance.overdue')} value={fmtNumber(ov?.overdueCount ?? 0)} tone="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t('finance.monthlyFlow')}</CardTitle>
          </CardHeader>
          <div className="h-[250px]">
            {ov?.monthlyFlow && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ov.monthlyFlow}>
                  <CartesianGrid stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="month" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={11} tickFormatter={(v) => fmtNumber(v)} />
                  <Tooltip contentStyle={{ background: '#15151a', border: '1px solid #ffffff10', borderRadius: 10 }} formatter={(v: number) => fmtCurrency(v)} />
                  <Bar dataKey="total" fill="#5350ff" radius={[6, 6, 0, 0]} name="Оплачено" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('finance.byType')}</CardTitle>
          </CardHeader>
          <div className="h-[250px]">
            {ov?.byType && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ov.byType} dataKey="total" nameKey="type" innerRadius={55} outerRadius={95} paddingAngle={2} stroke="#0a0a0b">
                    {ov.byType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#15151a', border: '1px solid #ffffff10', borderRadius: 10 }} formatter={(v: number) => fmtCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 text-sm text-neutral-200 focus:outline-none focus:border-white/15"
        >
          <option value="">Все статусы</option>
          <option value="Draft">Черновик</option>
          <option value="Issued">Выставлен</option>
          <option value="Paid">Оплачен</option>
          <option value="Partial">Частично</option>
          <option value="Overdue">Просрочен</option>
        </select>
      </div>

      <DataTable<Invoice>
        columns={columns}
        rows={invoices.data?.items ?? []}
        loading={invoices.isLoading}
        rowKey={(r) => r.id}
        searchAccessor={(r) => `${r.number} ${r.studentName} ${r.studentNumber} ${r.type}`}
        searchPlaceholder="Поиск по номеру, студенту, типу"
      />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'brand' | 'success' | 'gold' | 'danger';
}) {
  const toneColor = {
    brand: 'text-brand-300 bg-brand-500/10 border-brand-500/20',
    success: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
    gold: 'text-[#d4af6a] bg-[#d4af6a]/10 border-[#d4af6a]/25',
    danger: 'text-red-300 bg-red-500/10 border-red-500/25'
  }[tone];
  return (
    <Card>
      <div className="flex items-center gap-3 text-[12px] uppercase tracking-[0.18em] text-neutral-400">
        <span className={`size-8 rounded-lg border flex items-center justify-center ${toneColor}`}>{icon}</span>
        {label}
      </div>
      <div className="mt-3 font-display text-[26px] tracking-tight text-white">{value}</div>
    </Card>
  );
}
