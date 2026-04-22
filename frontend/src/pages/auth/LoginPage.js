import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock } from 'lucide-react';
import { api, extractError } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
export default function LoginPage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const setTokens = useAuthStore((s) => s.setTokens);
    const [email, setEmail] = useState('admin@piercex.kz');
    const [password, setPassword] = useState('Admin123!');
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password, rememberMe: remember });
            setTokens(data.accessToken, data.refreshToken, data.user);
            toast.success(`Добро пожаловать, ${data.user?.name ?? ''}`);
            nav('/');
        }
        catch (err) {
            toast.error(extractError(err));
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(AuthLayout, { title: t('auth.login'), subtitle: "\u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0432 Pierce X Hail Mery", footer: _jsxs(_Fragment, { children: [t('auth.noAccount'), ' ', _jsx(Link, { to: "/auth/register", className: "text-brand-300 hover:text-brand-200 underline-offset-2 hover:underline", children: t('auth.createAccount') })] }), children: _jsxs("form", { onSubmit: onSubmit, className: "flex flex-col gap-4", children: [_jsx(Input, { label: t('auth.email'), type: "email", icon: _jsx(Mail, { size: 15 }), required: true, value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email" }), _jsx(Input, { label: t('auth.password'), type: "password", icon: _jsx(Lock, { size: 15 }), required: true, value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password" }), _jsxs("div", { className: "flex items-center justify-between text-[13px] text-neutral-400", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "size-4 rounded bg-white/[0.04] border-white/10 accent-brand-500", checked: remember, onChange: (e) => setRemember(e.target.checked) }), t('auth.rememberMe')] }), _jsx(Link, { to: "/auth/forgot", className: "hover:text-white", children: t('auth.forgotLink') })] }), _jsx(Button, { type: "submit", size: "lg", loading: loading, children: t('auth.submitLogin') }), _jsx("div", { className: "mt-2 text-[11px] uppercase tracking-[0.2em] text-neutral-600 text-center", children: "demo \u00B7 admin@piercex.kz \u00B7 Admin123!" })] }) }));
}
