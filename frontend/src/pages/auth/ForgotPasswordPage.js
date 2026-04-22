import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail } from 'lucide-react';
import { api, extractError } from '@/lib/api';
export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
            toast.success('Если аккаунт существует — ссылка отправлена');
        }
        catch (e) {
            toast.error(extractError(e));
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(AuthLayout, { title: t('auth.forgot'), subtitle: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u043C \u0441\u0441\u044B\u043B\u043A\u0443 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043D\u0430 \u0432\u0430\u0448 email", footer: _jsx(Link, { to: "/auth/login", className: "text-brand-300 hover:text-brand-200", children: t('auth.backToLogin') }), children: sent ? (_jsx("div", { className: "text-[14px] text-neutral-300", children: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043F\u043E\u0447\u0442\u0443. \u0421\u0441\u044B\u043B\u043A\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 60 \u043C\u0438\u043D\u0443\u0442." })) : (_jsxs("form", { onSubmit: onSubmit, className: "flex flex-col gap-4", children: [_jsx(Input, { label: t('auth.email'), icon: _jsx(Mail, { size: 15 }), type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) }), _jsx(Button, { type: "submit", size: "lg", loading: loading, children: t('auth.sendReset') })] })) }));
}
