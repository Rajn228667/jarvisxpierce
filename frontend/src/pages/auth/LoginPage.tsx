import { FormEvent, useState } from 'react';
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password, rememberMe: remember });
      setTokens(data.accessToken, data.refreshToken, data.user);
      toast.success(`Добро пожаловать, ${data.user?.name ?? ''}`);
      nav('/');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t('auth.login')}
      subtitle="Войдите в Pierce X Hail Mery"
      footer={
        <>
          {t('auth.noAccount')}{' '}
          <Link to="/auth/register" className="text-brand-300 hover:text-brand-200 underline-offset-2 hover:underline">
            {t('auth.createAccount')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label={t('auth.email')}
          type="email"
          icon={<Mail size={15} />}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label={t('auth.password')}
          type="password"
          icon={<Lock size={15} />}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between text-[13px] text-neutral-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="size-4 rounded bg-white/[0.04] border-white/10 accent-brand-500"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            {t('auth.rememberMe')}
          </label>
          <Link to="/auth/forgot" className="hover:text-white">
            {t('auth.forgotLink')}
          </Link>
        </div>
        <Button type="submit" size="lg" loading={loading}>
          {t('auth.submitLogin')}
        </Button>

        <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-neutral-600 text-center">
          demo · admin@piercex.kz · Admin123!
        </div>
      </form>
    </AuthLayout>
  );
}
