import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { api, extractError } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
export default function VerifyEmailPage() {
    const { t } = useTranslation();
    const [sp] = useSearchParams();
    const nav = useNavigate();
    const email = sp.get('email') || '';
    const setTokens = useAuthStore((s) => s.setTokens);
    const [digits, setDigits] = useState(Array(6).fill(''));
    const [timer, setTimer] = useState(30);
    const [loading, setLoading] = useState(false);
    const refs = useRef([]);
    useEffect(() => {
        refs.current[0]?.focus();
    }, []);
    useEffect(() => {
        if (timer <= 0)
            return;
        const id = setInterval(() => setTimer((s) => s - 1), 1000);
        return () => clearInterval(id);
    }, [timer]);
    const setDigit = (i, v) => {
        const digit = v.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[i] = digit;
        setDigits(next);
        if (digit && i < 5)
            refs.current[i + 1]?.focus();
    };
    const handlePaste = (e) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text)
            return;
        e.preventDefault();
        const next = text.split('').concat(Array(6 - text.length).fill(''));
        setDigits(next);
        refs.current[Math.min(text.length, 5)]?.focus();
    };
    async function onSubmit(e) {
        e?.preventDefault();
        const code = digits.join('');
        if (code.length !== 6) {
            toast.error('Введите 6-значный код');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-email', { email, code });
            setTokens(data.accessToken, data.refreshToken, data.user);
            toast.success(t('auth.verifiedTitle'));
            nav('/');
        }
        catch (err) {
            toast.error(extractError(err));
        }
        finally {
            setLoading(false);
        }
    }
    async function resend() {
        try {
            await api.post('/auth/resend-verification', { email });
            toast.success('Код отправлен заново');
            setTimer(30);
        }
        catch (e) {
            toast.error(extractError(e));
        }
    }
    return (_jsx(AuthLayout, { title: t('auth.verify'), subtitle: t('auth.verifyHint', { email }), footer: _jsx(Link, { to: "/auth/login", className: "text-brand-300 hover:text-brand-200", children: t('auth.backToLogin') }), children: _jsxs("form", { onSubmit: onSubmit, className: "flex flex-col gap-5", children: [_jsx("div", { className: "flex justify-center gap-2.5", children: digits.map((d, i) => (_jsx("input", { ref: (el) => (refs.current[i] = el), value: d, onChange: (e) => setDigit(i, e.target.value), onPaste: handlePaste, onKeyDown: (e) => {
                            if (e.key === 'Backspace' && !digits[i] && i > 0)
                                refs.current[i - 1]?.focus();
                        }, inputMode: "numeric", maxLength: 1, className: "w-12 h-14 text-center font-display text-2xl rounded-xl bg-white/[0.03] border border-white/[0.07] text-white focus:outline-none focus:border-brand-500/60 focus:bg-white/[0.06] transition" }, i))) }), _jsx(Button, { type: "submit", size: "lg", loading: loading, children: t('auth.submitVerify') }), _jsxs("div", { className: "flex items-center justify-between text-[13px] text-neutral-400", children: [_jsx("span", { children: timer > 0 ? t('auth.resendIn', { seconds: timer }) : 'Не пришёл код?' }), _jsx("button", { type: "button", onClick: resend, disabled: timer > 0, className: "text-brand-300 hover:text-brand-200 disabled:text-neutral-600 disabled:pointer-events-none", children: t('auth.resend') })] }), _jsx("p", { className: "text-[11px] text-neutral-500 leading-relaxed", children: "Dev-\u0440\u0435\u0436\u0438\u043C: \u043A\u043E\u0434 \u043B\u043E\u0433\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u0432 \u043A\u043E\u043D\u0441\u043E\u043B\u044C backend \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0432 MailHog (http://localhost:8025)." })] }) }));
}
