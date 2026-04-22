import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtDate, cn } from '@/lib/utils';
function sevTone(s) {
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
        queryFn: async () => (await api.get('/notifications', { params: { take: 200 } })).data
    });
    const markAll = useMutation({
        mutationFn: async () => (await api.post('/notifications/read-all')).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifs'] });
            qc.invalidateQueries({ queryKey: ['notif-count'] });
        }
    });
    const markOne = useMutation({
        mutationFn: async (id) => (await api.post(`/notifications/${id}/read`)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifs'] });
            qc.invalidateQueries({ queryKey: ['notif-count'] });
        }
    });
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { title: t('notifications.title'), actions: _jsxs(Button, { variant: "subtle", size: "sm", onClick: () => markAll.mutate(), loading: markAll.isPending, children: [_jsx(CheckCheck, { size: 14 }), " ", t('notifications.markAll')] }) }), _jsx(Card, { className: "!p-0 overflow-hidden", children: _jsxs("div", { className: "divide-y divide-white/5", children: [list.isLoading && (_jsx("div", { className: "py-10 text-center text-neutral-500", children: t('common.loading') })), !list.isLoading && list.data?.length === 0 && (_jsxs("div", { className: "py-14 flex flex-col items-center gap-2 text-neutral-500", children: [_jsx(Bell, { size: 24, className: "opacity-50" }), t('notifications.empty')] })), list.data?.map((n) => (_jsxs("button", { onClick: () => !n.isRead && markOne.mutate(n.id), className: cn('w-full text-left py-4 px-5 flex items-start gap-4 hover:bg-white/[0.02]', !n.isRead && 'bg-brand-500/[0.04]'), children: [_jsx(Badge, { tone: sevTone(n.severity), children: n.severity }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[14px] text-neutral-100 font-medium", children: n.title }), !n.isRead && _jsx("span", { className: "size-1.5 rounded-full bg-brand-400" })] }), _jsx("div", { className: "text-[12.5px] text-neutral-400 mt-0.5 truncate", children: n.body })] }), _jsx("span", { className: "text-[11px] text-neutral-500 whitespace-nowrap", children: fmtDate(n.createdAt, true) })] }, n.id)))] }) })] }));
}
