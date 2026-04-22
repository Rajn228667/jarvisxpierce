import { useTranslation } from 'react-i18next';
import { Moon, Sun, Languages, Bell, Database, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import i18n from '@/i18n';
import { useState } from 'react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme, presentationMode, setPresentation } = useUIStore();
  const [lang, setLang] = useState(i18n.language);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2"><Languages size={13} /> {t('common.language')}</span>
            </CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {(['ru', 'kz', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  i18n.changeLanguage(l);
                  localStorage.setItem('pxhm.lang', l);
                  setLang(l);
                }}
                className={cn(
                  'h-10 px-4 rounded-xl text-[13px] border transition',
                  lang === l
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/[0.03] border-white/[0.07] text-neutral-400 hover:text-neutral-200'
                )}
              >
                {l === 'ru' ? 'Русский' : l === 'kz' ? 'Қазақша' : 'English'}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />} {t('settings.appearance')}
              </span>
            </CardTitle>
          </CardHeader>
          <div className="flex gap-2">
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'h-10 px-4 rounded-xl text-[13px] border inline-flex items-center gap-2',
                theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.03] border-white/[0.07] text-neutral-400'
              )}
            >
              <Moon size={14} /> {t('common.dark')}
            </button>
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'h-10 px-4 rounded-xl text-[13px] border inline-flex items-center gap-2',
                theme === 'light' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.03] border-white/[0.07] text-neutral-400'
              )}
            >
              <Sun size={14} /> {t('common.light')}
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2"><Sparkles size={13} /> {t('settings.presentation')}</span>
            </CardTitle>
          </CardHeader>
          <div className="flex items-center justify-between gap-4">
            <p className="text-[13px] text-neutral-400">{t('settings.presentationHint')}</p>
            <button
              onClick={() => setPresentation(!presentationMode)}
              className={cn(
                'relative h-7 w-12 rounded-full transition',
                presentationMode ? 'bg-brand-500' : 'bg-white/10'
              )}
              aria-pressed={presentationMode}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all',
                  presentationMode ? 'left-5' : 'left-0.5'
                )}
              />
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2"><Bell size={13} /> {t('settings.notif')}</span>
            </CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3 text-[13px] text-neutral-300">
            <label className="flex items-center justify-between">
              Email-уведомления <Badge tone="success">включено</Badge>
            </label>
            <label className="flex items-center justify-between">
              SMS/Push <Badge tone="neutral">roadmap</Badge>
            </label>
            <label className="flex items-center justify-between">
              Еженедельный digest <Badge tone="success">включено</Badge>
            </label>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>
              <span className="inline-flex items-center gap-2"><Database size={13} /> {t('settings.integrations')}</span>
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12.5px] text-neutral-300">
            <IntegrationRow name="Groq AI" hint="llama-3.3-70b · анализ доменов, чат, CV" ok />
            <IntegrationRow name="MailHog SMTP" hint="localhost:1025 · письма подтверждения" ok />
            <IntegrationRow name="Redis" hint="сессии, кэш, rate-limit" ok />
            <IntegrationRow name="SQL Server / SQLite" hint="реляционная БД + миграции" ok />
            <IntegrationRow name="PostgreSQL (analytics)" hint="roadmap — отдельный DWH" />
            <IntegrationRow name="SignalR" hint="roadmap — real-time обновления" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function IntegrationRow({ name, hint, ok }: { name: string; hint: string; ok?: boolean }) {
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <span className={cn('size-2 rounded-full', ok ? 'bg-emerald-400' : 'bg-neutral-600')} />
      <div className="flex-1 min-w-0">
        <div className="text-neutral-100">{name}</div>
        <div className="text-[11px] text-neutral-500">{hint}</div>
      </div>
      {ok ? <Badge tone="success">активен</Badge> : <Badge tone="neutral">план</Badge>}
    </div>
  );
}
