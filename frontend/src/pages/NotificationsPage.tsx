import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtDate, cn } from '@/lib/utils';

type Notif = {
  id: string;
  title: string;
  body: string;
  severity: string;
  link: string | null;
  isRead: boolean;
  category: string | null;
  createdAt: string;
};

function sevTone(s: string): 'danger' | 'warn' | 'success' | 'brand' {
  switch (s) {
    case 'Error':
      return 'danger';
    case 'Warning':
      return 'warn';
    case 'Success':
      return 'success';
    default:
      return 'brand';
  }
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['notifs'],
    queryFn: async () => (await api.get('/notifications', { params: { take: 200 } })).data as Notif[]
  });

  const markAll = useMutation({
    mutationFn: async () => (await api.post('/notifications/read-all')).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifs'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    }
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => (await api.post(`/notifications/${id}/read`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifs'] });
      qc.invalidateQueries({ queryKey: ['notif-count'] });
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('notifications.title')}
        actions={
          <Button
            variant="subtle"
            size="sm"
            onClick={() => markAll.mutate()}
            loading={markAll.isPending}
          >
            <CheckCheck size={14} /> {t('notifications.markAll')}
          </Button>
        }
      />

      <Card className="!p-0 overflow-hidden">
        <div className="divide-y divide-white/5">
          {list.isLoading && (
            <div className="py-10 text-center text-neutral-500">{t('common.loading')}</div>
          )}
          {!list.isLoading && list.data?.length === 0 && (
            <div className="py-14 flex flex-col items-center gap-2 text-neutral-500">
              <Bell size={24} className="opacity-50" />
              {t('notifications.empty')}
            </div>
          )}
          {list.data?.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markOne.mutate(n.id)}
              className={cn(
                'w-full text-left py-4 px-5 flex items-start gap-4 hover:bg-white/[0.02]',
                !n.isRead && 'bg-brand-500/[0.04]'
              )}
            >
              <Badge tone={sevTone(n.severity)}>{n.severity}</Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-neutral-100 font-medium">{n.title}</span>
                  {!n.isRead && <span className="size-1.5 rounded-full bg-brand-400" />}
                </div>
                <div className="text-[12.5px] text-neutral-400 mt-0.5 truncate">{n.body}</div>
              </div>
              <span className="text-[11px] text-neutral-500 whitespace-nowrap">
                {fmtDate(n.createdAt, true)}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
