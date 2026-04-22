import { FormEvent, useState } from 'react';
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

  async function onSubmit(e: FormEvent) {
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
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t('auth.reset')}
      subtitle="Задайте новый пароль"
      footer={
        <Link to="/auth/login" className="text-brand-300 hover:text-brand-200">
          {t('auth.backToLogin')}
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label={t('auth.password')}
          type="password"
          icon={<Lock size={15} />}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label={t('auth.confirmPassword')}
          type="password"
          icon={<Lock size={15} />}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" size="lg" loading={loading}>
          {t('common.save')}
        </Button>
      </form>
    </AuthLayout>
  );
}
