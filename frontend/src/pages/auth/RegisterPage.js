import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Calendar, Building2 } from 'lucide-react';
import { api, extractError } from '@/lib/api';
export default function RegisterPage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        surname: '',
        name: '',
        patronymic: '',
        birthDate: '',
        institution: ''
    });
    const [loading, setLoading] = useState(false);
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    async function onSubmit(e) {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Пароли не совпадают');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/register', form);
            toast.success('Код подтверждения отправлен');
            nav(`/auth/verify?email=${encodeURIComponent(form.email)}`);
        }
        catch (err) {
            toast.error(extractError(err));
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(AuthLayout, { title: t('auth.register'), subtitle: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442. \u041A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u043F\u0440\u0438\u0434\u0451\u0442 \u043D\u0430 email.", footer: _jsxs(_Fragment, { children: [t('auth.haveAccount'), ' ', _jsx(Link, { to: "/auth/login", className: "text-brand-300 hover:text-brand-200", children: t('auth.signIn') })] }), children: _jsxs("form", { onSubmit: onSubmit, className: "flex flex-col gap-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { label: t('auth.surname'), required: true, value: form.surname, onChange: set('surname') }), _jsx(Input, { label: t('auth.name'), required: true, value: form.name, onChange: set('name') })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { label: t('auth.patronymic'), value: form.patronymic, onChange: set('patronymic') }), _jsx(Input, { label: t('auth.birthDate'), type: "date", required: true, icon: _jsx(Calendar, { size: 14 }), value: form.birthDate, onChange: set('birthDate') })] }), _jsx(Input, { label: t('auth.email'), icon: _jsx(Mail, { size: 15 }), type: "email", required: true, value: form.email, onChange: set('email'), autoComplete: "email" }), _jsx(Input, { label: t('auth.institution'), icon: _jsx(Building2, { size: 14 }), value: form.institution, onChange: set('institution') }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { label: t('auth.password'), icon: _jsx(Lock, { size: 15 }), type: "password", required: true, value: form.password, onChange: set('password'), autoComplete: "new-password" }), _jsx(Input, { label: t('auth.confirmPassword'), icon: _jsx(Lock, { size: 15 }), type: "password", required: true, value: form.confirmPassword, onChange: set('confirmPassword'), autoComplete: "new-password" })] }), _jsx(Button, { type: "submit", size: "lg", loading: loading, className: "mt-2", children: t('auth.submitRegister') })] }) }));
}
