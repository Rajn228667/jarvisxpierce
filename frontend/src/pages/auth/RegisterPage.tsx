import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, Calendar, Building2 } from 'lucide-react';
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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: FormEvent) {
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
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t('auth.register')}
      subtitle="Создайте аккаунт. Код подтверждения придёт на email."
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link to="/auth/login" className="text-brand-300 hover:text-brand-200">
            {t('auth.signIn')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('auth.surname')} required value={form.surname} onChange={set('surname')} />
          <Input label={t('auth.name')} required value={form.name} onChange={set('name')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('auth.patronymic')} value={form.patronymic} onChange={set('patronymic')} />
          <Input
            label={t('auth.birthDate')}
            type="date"
            required
            icon={<Calendar size={14} />}
            value={form.birthDate}
            onChange={set('birthDate')}
          />
        </div>
        <Input
          label={t('auth.email')}
          icon={<Mail size={15} />}
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
        />
        <Input
          label={t('auth.institution')}
          icon={<Building2 size={14} />}
          value={form.institution}
          onChange={set('institution')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('auth.password')}
            icon={<Lock size={15} />}
            type="password"
            required
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
          />
          <Input
            label={t('auth.confirmPassword')}
            icon={<Lock size={15} />}
            type="password"
            required
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="lg" loading={loading} className="mt-2">
          {t('auth.submitRegister')}
        </Button>
      </form>
    </AuthLayout>
  );
}
