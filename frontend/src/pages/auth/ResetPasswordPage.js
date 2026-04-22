import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock } from 'lucide-react';
import { api, extractError } from '@/lib/api';
export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const [sp] = useSearchParams();
    const token = sp.get('token') || '';
    const nav = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        if (password !== confirm) {
            toast.error('Пароли не совпадают');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            toast.success('Пароль обновлён');
            nav('/auth/login');
        }
        catch (e) {
            toast.error(extractError(e));
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(AuthLayout, { title: t('auth.reset'), subtitle: "\u0417\u0430\u0434\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C", footer: _jsx(Link, { to: "/auth/login", className: "text-brand-300 hover:text-brand-200", children: t('auth.backToLogin') }), children: _jsxs("form", { onSubmit: onSubmit, className: "flex flex-col gap-4", children: [_jsx(Input, { label: t('auth.password'), type: "password", icon: _jsx(Lock, { size: 15 }), required: true, value: password, onChange: (e) => setPassword(e.target.value) }), _jsx(Input, { label: t('auth.confirmPassword'), type: "password", icon: _jsx(Lock, { size: 15 }), required: true, value: confirm, onChange: (e) => setConfirm(e.target.value) }), _jsx(Button, { type: "submit", size: "lg", loading: loading, children: t('common.save') })] }) }));
}
