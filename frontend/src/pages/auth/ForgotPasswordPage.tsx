import { FormEvent, useState } from 'react';
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Если аккаунт существует — ссылка отправлена');
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t('auth.forgot')}
      subtitle="Отправим ссылку восстановления на ваш email"
      footer={
        <Link to="/auth/login" className="text-brand-300 hover:text-brand-200">
          {t('auth.backToLogin')}
        </Link>
      }
    >
      {sent ? (
        <div className="text-[14px] text-neutral-300">Проверьте почту. Ссылка действует 60 минут.</div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label={t('auth.email')}
            icon={<Mail size={15} />}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" size="lg" loading={loading}>
            {t('auth.sendReset')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
