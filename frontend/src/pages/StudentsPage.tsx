import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtCurrency, fmtNumber, fmtPercent } from '@/lib/utils';

type Student = {
  id: string;
  studentNumber: string;
  fullName: string;
  email: string;
  major: string | null;
  gpa: number;
  attendanceRate: number;
  debtAmount: number;
  scholarshipAmount: number;
  dropoutRiskScore: number;
  group: string | null;
  institution: string | null;
  enrollmentYear: number;
};

function riskLevel(score: number) {
  if (score >= 0.75) return { tone: 'danger', label: 'Critical' };
  if (score >= 0.5) return { tone: 'warn', label: 'High' };
  if (score >= 0.25) return { tone: 'gold', label: 'Medium' };
  if (score > 0) return { tone: 'success', label: 'Low' };
  return { tone: 'neutral', label: 'None' };
}

export default function StudentsPage() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () =>
      (
        await api.get('/students', {
          params: { page: 1, pageSize: 500 }
        })
      ).data as { items: Student[]; total: number }
  });

  const columns: Column<Student>[] = useMemo(
    () => [
      {
        key: 'name',
        header: t('students.fields.name'),
        accessor: (r) => (
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[11px] font-semibold">
              {r.fullName
                .split(' ')
                .slice(0, 2)
                .map((p) => p[0])
                .join('')}
            </div>
            <div>
              <div className="text-neutral-100">{r.fullName}</div>
              <div className="text-[11px] text-neutral-500">{r.studentNumber} • {r.email}</div>
            </div>
          </div>
        ),
        sortValue: (r) => r.fullName
      },
      {
        key: 'major',
        header: t('students.fields.major'),
        accessor: (r) => <span className="text-neutral-300">{r.major ?? '—'}</span>,
        sortValue: (r) => r.major ?? ''
      },
      {
        key: 'group',
        header: 'Группа',
        accessor: (r) => <span className="text-neutral-400">{r.group ?? '—'}</span>
      },
      {
        key: 'year',
        header: t('students.fields.year'),
        accessor: (r) => <span>{r.enrollmentYear}</span>,
        sortValue: (r) => r.enrollmentYear
      },
      {
        key: 'gpa',
        header: t('students.fields.gpa'),
        accessor: (r) => <span className="font-mono text-neutral-100">{r.gpa.toFixed(2)}</span>,
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
        accessor: (r) => (
          <span className={r.debtAmount > 0 ? 'text-amber-300' : 'text-neutral-400'}>{fmtCurrency(r.debtAmount)}</span>
        ),
        sortValue: (r) => r.debtAmount
      },
      {
        key: 'risk',
        header: t('students.fields.risk'),
        accessor: (r) => {
          const lvl = riskLevel(r.dropoutRiskScore);
          return (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round(r.dropoutRiskScore * 100)}%`,
                    background:
                      r.dropoutRiskScore > 0.7
                        ? '#ef4444'
                        : r.dropoutRiskScore > 0.45
                        ? '#f59e0b'
                        : r.dropoutRiskScore > 0.25
                        ? '#d4af6a'
                        : '#10b981'
                  }}
                />
              </div>
              <Badge tone={lvl.tone as 'danger' | 'warn' | 'gold' | 'success' | 'neutral'}>
                {Math.round(r.dropoutRiskScore * 100)}%
              </Badge>
            </div>
          );
        },
        sortValue: (r) => r.dropoutRiskScore
      }
    ],
    [t]
  );

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
    } catch {
      toast.error('Не удалось экспортировать');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('students.title')}
        subtitle={t('students.subtitle')}
        actions={
          <Button variant="subtle" size="sm" onClick={onExport}>
            <Download size={14} /> {t('common.export')}
          </Button>
        }
      />

      <DataTable<Student>
        columns={columns}
        rows={data?.items ?? []}
        loading={isLoading}
        rowKey={(r) => r.id}
        searchAccessor={(r) => `${r.fullName} ${r.email} ${r.major ?? ''} ${r.studentNumber}`}
        searchPlaceholder="Поиск по имени, почте, специальности"
      />

      <div className="text-[12px] text-neutral-500">
        Найдено: <span className="text-neutral-300">{fmtNumber(data?.total ?? 0)}</span>
      </div>
    </div>
  );
}
