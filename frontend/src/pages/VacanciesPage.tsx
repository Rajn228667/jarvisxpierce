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

type VacancyListItem = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  status: string;
  isInternship: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  applications: number;
  publishedAt: string | null;
};

type Application = {
  id: string;
  applicant: string;
  email: string | null;
  status: string;
  aiMatchScore: number;
  aiSummary: string | null;
  createdAt: string;
};

type VacancyDetail = {
  summary: VacancyListItem;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  applicationsList: Application[];
};

function appStatusTone(s: string) {
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'internship' | 'fulltime'>('all');

  const list = useQuery({
    queryKey: ['vacancies', filter],
    queryFn: async () =>
      (
        await api.get('/vacancies', {
          params: {
            page: 1,
            pageSize: 50,
            internship: filter === 'all' ? undefined : filter === 'internship'
          }
        })
      ).data as { items: VacancyListItem[]; total: number }
  });

  const detail = useQuery({
    queryKey: ['vacancy', activeId],
    enabled: !!activeId,
    queryFn: async () => (await api.get(`/vacancies/${activeId}`)).data as VacancyDetail
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('vacancies.title')}
        subtitle={t('vacancies.subtitle')}
        actions={
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            {(['all', 'internship', 'fulltime'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'h-8 px-3 rounded-lg text-[12.5px] font-medium transition',
                  filter === f ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-neutral-200'
                )}
              >
                {f === 'all' ? 'Все' : f === 'internship' ? t('vacancies.internship') : 'Постоянная'}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-4">
        <div className="flex flex-col gap-3">
          {list.isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-5 w-48 mb-3" />
                <Skeleton className="h-3 w-36" />
              </Card>
            ))}
          {list.data?.items.map((v) => (
            <motion.button
              key={v.id}
              onClick={() => setActiveId(v.id)}
              whileHover={{ y: -2 }}
              className={cn(
                'text-left glass glass-hover rounded-2xl p-4 transition',
                activeId === v.id && 'border-brand-500/40 shadow-glow'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-medium text-white">{v.title}</h3>
                  <div className="flex items-center gap-2 text-[12px] text-neutral-400 mt-1">
                    <Building2 size={12} /> {v.company}
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-neutral-400 mt-1">
                    <MapPin size={12} /> {v.location || '—'}
                  </div>
                </div>
                {v.isInternship && <Badge tone="brand">{t('vacancies.internship')}</Badge>}
              </div>
              <div className="flex items-center justify-between mt-3 text-[12px]">
                <span className="text-[#d4af6a]">
                  {v.salaryMin ? `${fmtCurrency(v.salaryMin)} — ${fmtCurrency(v.salaryMax ?? v.salaryMin)}` : '—'}
                </span>
                <span className="flex items-center gap-1 text-neutral-500">
                  <Users size={12} /> {v.applications}
                </span>
              </div>
            </motion.button>
          ))}
          {list.data && list.data.items.length === 0 && (
            <Card>
              <div className="text-center text-neutral-500 py-8">{t('common.noResults')}</div>
            </Card>
          )}
        </div>

        <Card className="min-h-[420px]">
          {!activeId && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 text-neutral-500">
              <Briefcase size={36} className="mb-3 opacity-50" />
              <div>Выберите вакансию слева, чтобы увидеть откликов и AI-совпадения</div>
            </div>
          )}
          {activeId && detail.isLoading && <Skeleton className="h-[400px]" />}
          {detail.data && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-[24px] tracking-tight text-white">{detail.data.summary.title}</h2>
                    <div className="flex items-center gap-3 text-[13px] text-neutral-400 mt-1">
                      <span className="inline-flex items-center gap-1.5"><Building2 size={12} />{detail.data.summary.company}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin size={12} />{detail.data.summary.location || '—'}</span>
                      <span className="inline-flex items-center gap-1.5"><Users size={12} />{detail.data.summary.applications} откликов</span>
                    </div>
                  </div>
                  <Badge tone={detail.data.summary.isInternship ? 'brand' : 'gold'}>
                    {detail.data.summary.isInternship ? t('vacancies.internship') : 'Постоянная'}
                  </Badge>
                </div>
                {detail.data.description && (
                  <p className="text-[13.5px] text-neutral-300 mt-4 leading-relaxed whitespace-pre-line">
                    {detail.data.description}
                  </p>
                )}
                {detail.data.requirements && (
                  <div className="mt-4">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2">Требования</div>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.data.requirements
                        .split(/[,;•]/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((s, i) => (
                          <Badge key={i} tone="neutral">{s}</Badge>
                        ))}
                    </div>
                  </div>
                )}
                {detail.data.benefits && (
                  <div className="mt-4">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2">Условия</div>
                    <div className="text-[13px] text-neutral-300">{detail.data.benefits}</div>
                  </div>
                )}
              </div>

              <div>
                <CardHeader>
                  <CardTitle>{t('vacancies.applications')}</CardTitle>
                </CardHeader>
                <div className="flex flex-col divide-y divide-white/5">
                  {detail.data.applicationsList.length === 0 && (
                    <div className="py-8 text-center text-neutral-500">Пока нет откликов</div>
                  )}
                  {detail.data.applicationsList.map((a) => (
                    <div key={a.id} className="py-3 flex items-center gap-3">
                      <div className="size-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[11px] font-semibold">
                        {a.applicant
                          .split(' ')
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-neutral-100 text-[13.5px]">{a.applicant}</div>
                        <div className="text-[11.5px] text-neutral-500">{a.email ?? ''}</div>
                        {a.aiSummary && (
                          <div className="text-[11px] text-neutral-500 mt-1 italic">{a.aiSummary}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full"
                              style={{
                                width: `${Math.round(a.aiMatchScore * 100)}%`,
                                background:
                                  a.aiMatchScore > 0.75 ? '#10b981' : a.aiMatchScore > 0.5 ? '#d4af6a' : '#5350ff'
                              }}
                            />
                          </div>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {Math.round(a.aiMatchScore * 100)}%
                          </span>
                        </div>
                        <Badge tone={appStatusTone(a.status) as 'success' | 'gold' | 'brand' | 'danger' | 'neutral'}>{a.status}</Badge>
                      </div>
                      <div className="text-[11px] text-neutral-500 w-24 text-right">{fmtDate(a.createdAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
