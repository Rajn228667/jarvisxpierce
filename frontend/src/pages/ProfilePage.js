import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Monitor, Shield, UserRound } from 'lucide-react';
import { api, extractError } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
export default function ProfilePage() {
    const { t } = useTranslation();
    const qc = useQueryClient();
    const setUser = useAuthStore((s) => s.setUser);
    const [form, setForm] = useState({
        surname: '',
        name: '',
        patronymic: '',
        phone: '',
        institution: '',
        avatarUrl: ''
    });
    const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
    const profile = useQuery({
        queryKey: ['profile'],
        queryFn: async () => (await api.get('/profile/me')).data
    });
    const devices = useQuery({
        queryKey: ['devices'],
        queryFn: async () => (await api.get('/profile/devices')).data
    });
    useEffect(() => {
        if (profile.data) {
            setForm({
                surname: profile.data.surname ?? '',
                name: profile.data.name ?? '',
                patronymic: profile.data.patronymic ?? '',
                phone: '',
                institution: profile.data.institution ?? '',
                avatarUrl: profile.data.avatarUrl ?? ''
            });
        }
    }, [profile.data]);
    const update = useMutation({
        mutationFn: async () => (await api.patch('/profile/me', {
            surname: form.surname,
            name: form.name,
            patronymic: form.patronymic,
            phone: form.phone || null,
            avatarUrl: form.avatarUrl || null,
            institution: form.institution
        })).data,
        onSuccess: (p) => {
            setUser({
                id: p.id,
                email: p.email,
                surname: p.surname,
                name: p.name,
                patronymic: p.patronymic,
                role: p.role,
                avatarUrl: p.avatarUrl,
                language: p.preferredLanguage,
                theme: p.theme
            });
            toast.success('Профиль обновлён');
            qc.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (e) => toast.error(extractError(e))
    });
    const changePwd = useMutation({
        mutationFn: async () => (await api.post('/profile/change-password', {
            oldPassword: pwd.current,
            newPassword: pwd.next
        })).data,
        onSuccess: () => {
            toast.success('Пароль изменён');
            setPwd({ current: '', next: '', confirm: '' });
        },
        onError: (e) => toast.error(extractError(e))
    });
    const revoke = useMutation({
        mutationFn: async (id) => (await api.delete(`/profile/devices/${id}`)).data,
        onSuccess: () => {
            toast.success('Сессия отозвана');
            qc.invalidateQueries({ queryKey: ['devices'] });
        }
    });
    const onPwdSubmit = (e) => {
        e.preventDefault();
        if (pwd.next.length < 8)
            return toast.error('Минимум 8 символов');
        if (pwd.next !== pwd.confirm)
            return toast.error('Пароли не совпадают');
        changePwd.mutate();
    };
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { title: t('profile.title'), subtitle: t('profile.subtitle') }), _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx(UserRound, { size: 13 }), t('profile.personal')] }) }) }), _jsxs("form", { onSubmit: (e) => {
                                    e.preventDefault();
                                    update.mutate();
                                }, className: "flex flex-col gap-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { label: t('auth.surname'), value: form.surname, onChange: (e) => setForm({ ...form, surname: e.target.value }) }), _jsx(Input, { label: t('auth.name'), value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })] }), _jsx(Input, { label: t('auth.patronymic'), value: form.patronymic, onChange: (e) => setForm({ ...form, patronymic: e.target.value }) }), _jsx(Input, { label: "Email", value: profile.data?.email ?? '', disabled: true }), _jsx(Input, { label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) }), _jsx(Input, { label: t('auth.institution'), value: form.institution, onChange: (e) => setForm({ ...form, institution: e.target.value }) }), _jsx("div", { className: "flex justify-end mt-1", children: _jsx(Button, { type: "submit", loading: update.isPending, children: t('common.save') }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx(Shield, { size: 13 }), t('profile.security')] }) }) }), _jsxs("form", { onSubmit: onPwdSubmit, className: "flex flex-col gap-3", children: [_jsx(Input, { label: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C", type: "password", value: pwd.current, onChange: (e) => setPwd({ ...pwd, current: e.target.value }) }), _jsx(Input, { label: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C", type: "password", value: pwd.next, onChange: (e) => setPwd({ ...pwd, next: e.target.value }) }), _jsx(Input, { label: t('auth.confirmPassword'), type: "password", value: pwd.confirm, onChange: (e) => setPwd({ ...pwd, confirm: e.target.value }) }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { type: "submit", loading: changePwd.isPending, children: t('profile.changePassword') }) })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx(Monitor, { size: 13 }), t('profile.devices')] }) }) }), _jsxs("div", { className: "divide-y divide-white/5", children: [devices.data?.length === 0 && (_jsx("div", { className: "py-6 text-center text-neutral-500", children: t('common.empty') })), devices.data?.map((d) => (_jsxs("div", { className: "py-3 flex items-center gap-4", children: [_jsx(Monitor, { size: 16, className: "text-neutral-500" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[13.5px] text-neutral-100", children: d.name || 'Устройство' }), d.isTrusted && _jsx(Badge, { tone: "success", children: "Trusted" }), d.os && _jsx(Badge, { tone: "neutral", children: d.os }), d.browser && _jsx(Badge, { tone: "neutral", children: d.browser })] }), _jsx("div", { className: "text-[11.5px] text-neutral-500 truncate", children: d.ip || '—' })] }), _jsx("span", { className: "text-[11px] text-neutral-500 w-32 text-right", children: fmtDate(d.lastSeenAt, true) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => revoke.mutate(d.id), children: t('profile.revoke') })] }, d.id)))] })] })] }));
}
