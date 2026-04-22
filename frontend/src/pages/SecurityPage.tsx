import { FormEvent, useState } from 'react';
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
import { DataTable, Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtDate, fmtNumber } from '@/lib/utils';

type DomainItem = {
  id: string;
  url: string;
  host: string | null;
  category: string;
  risk: string;
  riskScore: number;
  country: string | null;
  reasons: string | null;
  lastCheckedAt: string | null;
  isBlacklisted: boolean;
};

type FraudCase = {
  id: string;
  code: string;
  title: string;
  category: string;
  status: string;
  risk: string;
  aiSummary: string | null;
  createdAt: string;
};

type ByCategoryItem = { category: string; count: number; avgRisk: number };
type TopRiskyItem = { url: string; host: string | null; category: string; riskScore: number; risk: string; isBlacklisted: boolean };

type Overview = {
  totalDomains: number;
  blacklisted: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  openCases: number;
  resolvedCases: number;
  byCategory: ByCategoryItem[];
  topRisky: TopRiskyItem[];
};

const PIE_COLORS = ['#5350ff', '#d4af6a', '#10b981', '#ef4444', '#f59e0b', '#6b7280', '#06b6d4', '#ec4899'];

function riskTone(level: string): 'danger' | 'warn' | 'gold' | 'success' | 'neutral' {
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
  const [lastScan, setLastScan] = useState<DomainItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const overview = useQuery({
    queryKey: ['sec-overview'],
    queryFn: async () => (await api.get('/security/overview')).data as Overview
  });
  const domains = useQuery({
    queryKey: ['sec-domains', categoryFilter],
    queryFn: async () =>
      (
        await api.get('/security/domains', {
          params: { page: 1, pageSize: 500, category: categoryFilter || undefined }
        })
      ).data as { items: DomainItem[]; total: number }
  });
  const cases = useQuery({
    queryKey: ['sec-cases'],
    queryFn: async () =>
      (await api.get('/security/cases', { params: { page: 1, pageSize: 50 } })).data as {
        items: FraudCase[];
        total: number;
      }
  });

  const scan = useMutation({
    mutationFn: async (u: string) => (await api.post('/security/domains/scan', { url: u })).data as DomainItem,
    onSuccess: (data) => {
      setLastScan(data);
      toast.success(`Домен проверен: риск ${Math.round(data.riskScore)}/100`);
      qc.invalidateQueries({ queryKey: ['sec-domains'] });
      qc.invalidateQueries({ queryKey: ['sec-overview'] });
    },
    onError: (e) => toast.error(extractError(e))
  });

  const toggleBlack = useMutation({
    mutationFn: async (id: string) => (await api.post(`/security/domains/${id}/blacklist`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sec-domains'] });
      qc.invalidateQueries({ queryKey: ['sec-overview'] });
      toast.success('Статус обновлён');
    },
    onError: (e) => toast.error(extractError(e))
  });

  const createCase = useMutation({
    mutationFn: async (id: string) => (await api.post(`/security/domains/${id}/case`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sec-cases'] });
      toast.success('Расследование открыто');
    },
    onError: (e) => toast.error(extractError(e))
  });

  const onScan = (e: FormEvent) => {
    e.preventDefault();
    const d = urlInput.trim();
    if (!d) return;
    scan.mutate(d);
  };

  const columns: Column<DomainItem>[] = [
    {
      key: 'domain',
      header: 'Домен',
      accessor: (r) => (
        <div>
          <div className="text-neutral-100 font-mono">{r.host ?? r.url}</div>
          <div className="text-[11px] text-neutral-500">
            {r.lastCheckedAt ? fmtDate(r.lastCheckedAt, true) : '—'}
          </div>
        </div>
      ),
      sortValue: (r) => r.host ?? r.url
    },
    {
      key: 'category',
      header: 'Категория',
      accessor: (r) => <Badge tone="neutral">{r.category}</Badge>,
      sortValue: (r) => r.category
    },
    {
      key: 'risk',
      header: 'Риск',
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${r.riskScore}%`,
                background:
                  r.riskScore > 75
                    ? '#ef4444'
                    : r.riskScore > 50
                    ? '#f59e0b'
                    : r.riskScore > 25
                    ? '#d4af6a'
                    : '#10b981'
              }}
            />
          </div>
          <Badge tone={riskTone(r.risk)}>{Math.round(r.riskScore)}</Badge>
        </div>
      ),
      sortValue: (r) => r.riskScore
    },
    {
      key: 'black',
      header: 'Чёрный список',
      accessor: (r) =>
        r.isBlacklisted ? <Badge tone="danger">в ч/с</Badge> : <Badge tone="neutral">нет</Badge>,
      sortValue: (r) => (r.isBlacklisted ? 1 : 0)
    },
    {
      key: 'reasons',
      header: 'Причины',
      accessor: (r) => (
        <span className="text-[12px] text-neutral-400 line-clamp-2">{r.reasons ?? '—'}</span>
      )
    },
    {
      key: 'actions',
      header: '',
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => toggleBlack.mutate(r.id)}>
            <Ban size={12} /> {r.isBlacklisted ? 'Снять' : 'В ч/с'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => createCase.mutate(r.id)}>
            <Flag size={12} /> Кейс
          </Button>
        </div>
      )
    }
  ];

  const ov = overview.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('security.title')} subtitle={t('security.subtitle')} />

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-radial-luxe" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="size-12 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-300">
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] text-neutral-200 font-medium">
              AI-анализатор подозрительных ресурсов
            </div>
            <div className="text-[12px] text-neutral-500">
              Groq · llama-3.3-70b · категоризация (казино / фишинг / пирамида / мошенничество) ·
              авто-внесение в ч/с при критическом риске
            </div>
          </div>
          <form onSubmit={onScan} className="flex items-center gap-2 w-full md:w-[520px]">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t('security.placeholder')}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm focus:outline-none focus:border-brand-500/60"
              />
            </div>
            <Button type="submit" loading={scan.isPending}>
              {t('security.scan')}
            </Button>
          </form>
        </div>

        {lastScan && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-neutral-100">{lastScan.host ?? lastScan.url}</span>
                <Badge tone={riskTone(lastScan.risk)}>{lastScan.risk}</Badge>
                <Badge tone="neutral">{lastScan.category}</Badge>
                {lastScan.isBlacklisted && <Badge tone="danger">авто в ч/с</Badge>}
              </div>
              <p className="text-[13px] text-neutral-300 mt-2 leading-relaxed">
                {lastScan.reasons || '—'}
              </p>
              <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 mt-2">
                Риск {Math.round(lastScan.riskScore)}/100
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="subtle" onClick={() => toggleBlack.mutate(lastScan.id)}>
                <Ban size={13} /> {lastScan.isBlacklisted ? 'Снять с ч/с' : 'В ч/с'}
              </Button>
              <Button variant="subtle" onClick={() => createCase.mutate(lastScan.id)}>
                <Flag size={13} /> Открыть расследование
              </Button>
            </div>
          </motion.div>
        )}
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<ShieldCheck size={16} />}
          label={t('security.monitored')}
          value={fmtNumber(ov?.totalDomains ?? 0)}
          tone="brand"
        />
        <KpiCard
          icon={<Ban size={16} />}
          label={t('security.blacklisted')}
          value={fmtNumber(ov?.blacklisted ?? 0)}
          tone="danger"
        />
        <KpiCard
          icon={<Flag size={16} />}
          label="Активные кейсы"
          value={fmtNumber(ov?.openCases ?? 0)}
          tone="gold"
        />
        <KpiCard
          icon={<ShieldAlert size={16} />}
          label="Критический риск"
          value={fmtNumber(ov?.critical ?? 0)}
          tone="danger"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t('security.topRisky')}</CardTitle>
          </CardHeader>
          <div className="flex flex-col divide-y divide-white/5">
            {ov?.topRisky?.slice(0, 8).map((d, i) => (
              <div key={i} className="py-2.5 flex items-center gap-3">
                <span className="font-mono text-[13px] text-neutral-100 flex-1 truncate">
                  {d.host ?? d.url}
                </span>
                <Badge tone="neutral">{d.category}</Badge>
                <div className="w-28 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${d.riskScore}%`,
                      background:
                        d.riskScore > 75 ? '#ef4444' : d.riskScore > 50 ? '#f59e0b' : '#d4af6a'
                    }}
                  />
                </div>
                <span className="text-[12px] font-mono text-neutral-300 w-10 text-right">
                  {Math.round(d.riskScore)}
                </span>
              </div>
            ))}
            {(!ov?.topRisky || ov.topRisky.length === 0) && (
              <div className="py-8 text-center text-neutral-500">{t('security.empty')}</div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('security.categories')}</CardTitle>
          </CardHeader>
          <div className="h-[240px]">
            {ov?.byCategory && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ov.byCategory}
                    dataKey="count"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="#0a0a0b"
                  >
                    {ov.byCategory.map((_, i) => (
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
            )}
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 text-sm text-neutral-200 focus:outline-none focus:border-white/15"
        >
          <option value="">Все категории</option>
          <option value="Casino">Казино</option>
          <option value="Phishing">Фишинг</option>
          <option value="Pyramid">Пирамида</option>
          <option value="Scam">Мошенничество</option>
          <option value="GamblingAd">Реклама азартных игр</option>
          <option value="TelegramSeller">Telegram-продавец</option>
          <option value="CleanVerified">Чистый</option>
        </select>
      </div>

      <DataTable<DomainItem>
        columns={columns}
        rows={domains.data?.items ?? []}
        loading={domains.isLoading}
        rowKey={(r) => r.id}
        searchAccessor={(r) => `${r.url} ${r.host ?? ''} ${r.category}`}
        searchPlaceholder="Поиск по домену"
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('security.cases')}</CardTitle>
        </CardHeader>
        <div className="divide-y divide-white/5">
          {cases.data?.items?.length === 0 && (
            <div className="py-6 text-center text-neutral-500">{t('security.empty')}</div>
          )}
          {cases.data?.items?.map((c) => (
            <div key={c.id} className="py-3 flex items-center gap-3">
              <Badge tone={riskTone(c.risk)}>{c.risk}</Badge>
              <span className="font-mono text-[12px] text-neutral-400">{c.code}</span>
              <span className="text-[13.5px] text-neutral-100 flex-1 truncate">{c.title}</span>
              <Badge tone="neutral">{c.status}</Badge>
              <span className="text-[11px] text-neutral-500 w-28 text-right">
                {fmtDate(c.createdAt, true)}
              </span>
            </div>
          ))}
        </div>
      </Card>
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
        <span className={`size-8 rounded-lg border flex items-center justify-center ${toneColor}`}>
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-3 font-display text-[26px] tracking-tight text-white">{value}</div>
    </Card>
  );
}
