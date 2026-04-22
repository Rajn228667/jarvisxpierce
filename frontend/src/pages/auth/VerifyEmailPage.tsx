import { FormEvent, useEffect, useRef, useState } from 'react';
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
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = text.split('').concat(Array(6 - text.length).fill(''));
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  async function onSubmit(e?: FormEvent) {
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
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Код отправлен заново');
      setTimer(30);
    } catch (e) {
      toast.error(extractError(e));
    }
  }

  return (
    <AuthLayout
      title={t('auth.verify')}
      subtitle={t('auth.verifyHint', { email })}
      footer={
        <Link to="/auth/login" className="text-brand-300 hover:text-brand-200">
          {t('auth.backToLogin')}
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex justify-center gap-2.5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center font-display text-2xl rounded-xl bg-white/[0.03] border border-white/[0.07] text-white focus:outline-none focus:border-brand-500/60 focus:bg-white/[0.06] transition"
            />
          ))}
        </div>

        <Button type="submit" size="lg" loading={loading}>
          {t('auth.submitVerify')}
        </Button>

        <div className="flex items-center justify-between text-[13px] text-neutral-400">
          <span>
            {timer > 0 ? t('auth.resendIn', { seconds: timer }) : 'Не пришёл код?'}
          </span>
          <button
            type="button"
            onClick={resend}
            disabled={timer > 0}
            className="text-brand-300 hover:text-brand-200 disabled:text-neutral-600 disabled:pointer-events-none"
          >
            {t('auth.resend')}
          </button>
        </div>

        <p className="text-[11px] text-neutral-500 leading-relaxed">
          Dev-режим: код логируется в консоль backend и отправляется в MailHog (http://localhost:8025).
        </p>
      </form>
    </AuthLayout>
  );
}
