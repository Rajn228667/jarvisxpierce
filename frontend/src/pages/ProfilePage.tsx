import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Monitor, Shield, UserRound } from 'lucide-react';
import { api, extractError } from '@/lib/api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { fmtDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

type UserDto = {
  id: string;
  email: string;
  surname: string;
  name: string;
  patronymic?: string | null;
  role: string;
  avatarUrl?: string | null;
  institution?: string | null;
  preferredLanguage: string;
  theme: string;
  emailConfirmed: boolean;
};

type ProfileForm = {
  surname: string;
  name: string;
  patronymic: string;
  phone: string;
  institution: string;
  avatarUrl: string;
};

type Device = {
  id: string;
  name: string | null;
  os: string | null;
  browser: string | null;
  ip: string | null;
  lastSeenAt: string;
  isTrusted: boolean;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState<ProfileForm>({
    surname: '',
    name: '',
    patronymic: '',
    phone: '',
    institution: '',
    avatarUrl: ''
  });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile/me')).data as UserDto
  });
  const devices = useQuery({
    queryKey: ['devices'],
    queryFn: async () => (await api.get('/profile/devices')).data as Device[]
  });

  useEffect(() => {
    if (profile.data) {
      setForm({
        surname: profile.data.surname ?? '',
        name: profile.data.name ?? '',
        patronymic: profile.data.patronymic ?? '',
        phone: '',
        institution: profile.data.institution ?? '',
        avatarUrl: profile.data.avatarUrl ?? ''
      });
    }
  }, [profile.data]);

  const update = useMutation({
    mutationFn: async () =>
      (
        await api.patch('/profile/me', {
          surname: form.surname,
          name: form.name,
          patronymic: form.patronymic,
          phone: form.phone || null,
          avatarUrl: form.avatarUrl || null,
          institution: form.institution
        })
      ).data as UserDto,
    onSuccess: (p) => {
      setUser({
        id: p.id,
        email: p.email,
        surname: p.surname,
        name: p.name,
        patronymic: p.patronymic,
        role: p.role,
        avatarUrl: p.avatarUrl,
        language: p.preferredLanguage,
        theme: p.theme
      });
      toast.success('Профиль обновлён');
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e) => toast.error(extractError(e))
  });

  const changePwd = useMutation({
    mutationFn: async () =>
      (
        await api.post('/profile/change-password', {
          oldPassword: pwd.current,
          newPassword: pwd.next
        })
      ).data,
    onSuccess: () => {
      toast.success('Пароль изменён');
      setPwd({ current: '', next: '', confirm: '' });
    },
    onError: (e) => toast.error(extractError(e))
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/profile/devices/${id}`)).data,
    onSuccess: () => {
      toast.success('Сессия отозвана');
      qc.invalidateQueries({ queryKey: ['devices'] });
    }
  });

  const onPwdSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pwd.next.length < 8) return toast.error('Минимум 8 символов');
    if (pwd.next !== pwd.confirm) return toast.error('Пароли не совпадают');
    changePwd.mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <UserRound size={13} />
                {t('profile.personal')}
              </span>
            </CardTitle>
          </CardHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate();
            }}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('auth.surname')}
                value={form.surname}
                onChange={(e) => setForm({ ...form, surname: e.target.value })}
              />
              <Input
                label={t('auth.name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <Input
              label={t('auth.patronymic')}
              value={form.patronymic}
              onChange={(e) => setForm({ ...form, patronymic: e.target.value })}
            />
            <Input label="Email" value={profile.data?.email ?? ''} disabled />
            <Input
              label="Телефон"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label={t('auth.institution')}
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
            />
            <div className="flex justify-end mt-1">
              <Button type="submit" loading={update.isPending}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <Shield size={13} />
                {t('profile.security')}
              </span>
            </CardTitle>
          </CardHeader>
          <form onSubmit={onPwdSubmit} className="flex flex-col gap-3">
            <Input
              label="Текущий пароль"
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            />
            <Input
              label="Новый пароль"
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
            />
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={changePwd.isPending}>
                {t('profile.changePassword')}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Monitor size={13} />
              {t('profile.devices')}
            </span>
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-white/5">
          {devices.data?.length === 0 && (
            <div className="py-6 text-center text-neutral-500">{t('common.empty')}</div>
          )}
          {devices.data?.map((d) => (
            <div key={d.id} className="py-3 flex items-center gap-4">
              <Monitor size={16} className="text-neutral-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] text-neutral-100">{d.name || 'Устройство'}</span>
                  {d.isTrusted && <Badge tone="success">Trusted</Badge>}
                  {d.os && <Badge tone="neutral">{d.os}</Badge>}
                  {d.browser && <Badge tone="neutral">{d.browser}</Badge>}
                </div>
                <div className="text-[11.5px] text-neutral-500 truncate">{d.ip || '—'}</div>
              </div>
              <span className="text-[11px] text-neutral-500 w-32 text-right">
                {fmtDate(d.lastSeenAt, true)}
              </span>
              <Button variant="ghost" size="sm" onClick={() => revoke.mutate(d.id)}>
                {t('profile.revoke')}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
