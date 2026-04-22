import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { fmtCurrency, fmtDate, fmtNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

type Kpi = {
  key: string;
  label: string;
  value: number;
  delta: number;
  trend: 'up' | 'down';
  format: 'integer' | 'number' | 'percent' | 'currency';
};

type Overview = {
  kpis: Kpi[];
  risk: { blockedDomains: number; fraudCases: number; studentsAtRisk: number };
  counts: {
    institutions: number;
    companies: number;
    unreadNotifs: number;
    totalScholarships: number;
  };
};

type Trends = {
  paymentsSeries: { date: string; total: number }[];
  enrollmentGroups: { year: number; count: number }[];
  riskBuckets: { label: string; value: number }[];
  domainCategories: { category: string; value: number }[];
};

type ActivityItem = {
  id: string;
  at: string;
  action: string;
  entity: string | null;
  details: string | null;
  actor: string | null;
};

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

function formatValue(v: number, f: Kpi['format']) {
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
    queryFn: async () => (await api.get('/dashboard/overview')).data as Overview
  });
  const trends = useQuery({
    queryKey: ['dash-trends'],
    queryFn: async () => (await api.get('/dashboard/trends')).data as Trends
  });
  const activity = useQuery({
    queryKey: ['dash-activity'],
    queryFn: async () =>
      (await api.get('/dashboard/activity', { params: { take: 12 } })).data as ActivityItem[]
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {overview.isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-7 w-32" />
            </Card>
          ))}
        {overview.data?.kpis?.map((k, i) => (
          <motion.div
            key={k.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{k.label}</CardTitle>
                <Badge tone={k.trend === 'up' ? 'success' : 'danger'}>
                  {k.trend === 'up' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {Math.abs(k.delta).toFixed(1)}%
                </Badge>
              </div>
              <div className="mt-2 font-display text-[28px] tracking-tight text-white">
                {formatValue(k.value, k.format)}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.payments30')}</CardTitle>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <TrendingUp size={12} /> +9.4%
            </div>
          </CardHeader>
          <div className="h-[260px] -mx-2">
            {trends.data?.paymentsSeries ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.data.paymentsSeries}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5350ff" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#5350ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#737373"
                    fontSize={11}
                    tickFormatter={(d) => String(d).slice(5)}
                  />
                  <YAxis stroke="#737373" fontSize={11} tickFormatter={(v) => fmtNumber(v)} />
                  <Tooltip
                    contentStyle={{
                      background: '#15151a',
                      border: '1px solid #ffffff10',
                      borderRadius: 10
                    }}
                    formatter={(v: number) => fmtCurrency(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#7070ff"
                    fill="url(#g1)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.domainCats')}</CardTitle>
          </CardHeader>
          <div className="h-[260px]">
            {trends.data?.domainCategories ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trends.data.domainCategories}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    stroke="#0a0a0b"
                  >
                    {trends.data.domainCategories.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#15151a',
                      border: '1px solid #ffffff10',
                      borderRadius: 10
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
          <div className="mt-3 space-y-1.5 text-[12px]">
            {trends.data?.domainCategories?.slice(0, 6).map((c, i) => (
              <div
                key={c.category}
                className="flex items-center justify-between text-neutral-400"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span>{c.category}</span>
                </div>
                <span className="text-neutral-200">{c.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.enrollment')}</CardTitle>
          </CardHeader>
          <div className="h-[230px]">
            {trends.data?.enrollmentGroups ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.data.enrollmentGroups}>
                  <CartesianGrid stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="year" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: '#15151a',
                      border: '1px solid #ffffff10',
                      borderRadius: 10
                    }}
                  />
                  <Bar dataKey="count" fill="#5350ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.dropoutDist')}</CardTitle>
          </CardHeader>
          <div className="h-[230px]">
            {trends.data?.riskBuckets ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.data.riskBuckets}>
                  <CartesianGrid stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="label" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: '#15151a',
                      border: '1px solid #ffffff10',
                      borderRadius: 10
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#d4af6a"
                    strokeWidth={2.5}
                    dot={{ fill: '#d4af6a', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.activity')}</CardTitle>
        </CardHeader>
        <div className="divide-y divide-white/5">
          {activity.isLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 my-3" />)}
          {activity.data?.map((a) => (
            <div key={a.id} className="py-3 flex items-start gap-3 text-[13px]">
              <span className="mt-1 size-1.5 rounded-full bg-brand-400" />
              <div className="flex-1 min-w-0">
                <div className="text-neutral-200">
                  <span className="font-medium">{a.actor ?? 'Система'}</span>{' '}
                  <span className="text-neutral-400">{a.action}</span>{' '}
                  <span className="text-neutral-500">· {a.entity ?? ''}</span>
                </div>
                {a.details && (
                  <div className="text-neutral-500 text-[12px] truncate max-w-[720px]">
                    {a.details}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-neutral-500 whitespace-nowrap">
                {fmtDate(a.at, true)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
