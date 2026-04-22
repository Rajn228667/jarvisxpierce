import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Users,
  Wallet,
  Briefcase,
  ShieldAlert,
  Sparkles,
  Bell,
  UserCircle2,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Globe2,
  Moon,
  Sun,
  Menu
} from 'lucide-react';
import { BrandLockup } from '@/components/brand/Logo';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { cn, initials } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState } from 'react';
import i18n from '@/i18n';

export function AppShell() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, theme, setTheme } = useUIStore();
  const nav = useNavigate();

  const { data: unread } = useQuery({
    queryKey: ['notif-count'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data as { count: number },
    refetchInterval: 30000
  });

  const items = [
    { to: '/', icon: BarChart3, label: t('nav.dashboard'), end: true },
    { to: '/students', icon: Users, label: t('nav.students') },
    { to: '/finance', icon: Wallet, label: t('nav.finance') },
    { to: '/vacancies', icon: Briefcase, label: t('nav.vacancies') },
    { to: '/security', icon: ShieldAlert, label: t('nav.security') },
    { to: '/ai', icon: Sparkles, label: t('nav.ai') }
  ];

  return (
    <div className="min-h-screen bg-[#07070a] text-neutral-100 relative">
      <div className="pointer-events-none fixed inset-0 bg-radial-luxe opacity-80" />
      <div className="relative flex min-h-screen">
        <aside
          className={cn(
            'sticky top-0 h-screen shrink-0 flex flex-col hairline-t hairline-b border-r border-white/5 bg-[#0a0a0b]/60 backdrop-blur-xl transition-[width] duration-300',
            sidebarCollapsed ? 'w-[76px]' : 'w-[260px]'
          )}
        >
          <div className="px-4 py-5 flex items-center justify-between">
            <BrandLockup collapsed={sidebarCollapsed} />
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-white/5 text-neutral-400"
              aria-label="toggle sidebar"
            >
              <Menu size={16} />
            </button>
          </div>
          <nav className="flex-1 px-3 overflow-y-auto">
            <div className="text-[10px] uppercase tracking-[0.22em] text-neutral-600 px-3 py-2">
              {!sidebarCollapsed && 'Модули'}
            </div>
            <ul className="space-y-1">
              {items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    end={it.end}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium transition',
                        isActive
                          ? 'bg-white/[0.06] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]'
                          : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                      )
                    }
                  >
                    <it.icon size={17} className="shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{it.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="text-[10px] uppercase tracking-[0.22em] text-neutral-600 px-3 pt-5 pb-2">
              {!sidebarCollapsed && 'Аккаунт'}
            </div>
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/notifications"
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium transition',
                      isActive ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    )
                  }
                >
                  <Bell size={17} />
                  {!sidebarCollapsed && <span className="flex-1">{t('nav.notifications')}</span>}
                  {unread && unread.count > 0 && (
                    <span className="text-[10px] px-1.5 py-[1px] rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {unread.count}
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium transition',
                      isActive ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    )
                  }
                >
                  <UserCircle2 size={17} />
                  {!sidebarCollapsed && <span>{t('nav.profile')}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium transition',
                      isActive ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    )
                  }
                >
                  <SettingsIcon size={17} />
                  {!sidebarCollapsed && <span>{t('nav.settings')}</span>}
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="p-3">
            <button
              onClick={() => {
                logout();
                nav('/auth/login');
              }}
              className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            >
              <LogOut size={17} />
              {!sidebarCollapsed && <span>{t('nav.logout')}</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <Topbar />
          <div className="flex-1 px-6 py-6 lg:px-10 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function Topbar() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [lang, setLang] = useState(i18n.language);

  const userName = user ? `${user.surname} ${user.name}`.trim() : '—';

  return (
    <header className="sticky top-0 z-30 px-6 lg:px-10 h-[68px] flex items-center gap-4 bg-[#07070a]/70 backdrop-blur-xl hairline-b">
      <div className="flex-1 max-w-xl relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          placeholder={t('common.search') + '…'}
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-white/15"
        />
      </div>

      <button
        onClick={() => {
          const next = lang === 'ru' ? 'kz' : lang === 'kz' ? 'en' : 'ru';
          i18n.changeLanguage(next);
          localStorage.setItem('pxhm.lang', next);
          setLang(next);
        }}
        className="h-10 px-3 rounded-xl text-xs font-medium uppercase tracking-[0.2em] text-neutral-300 border border-white/10 hover:bg-white/5 flex items-center gap-2"
      >
        <Globe2 size={14} />
        {lang}
      </button>

      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-10 w-10 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center text-neutral-300"
        aria-label="toggle theme"
      >
        {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
      </button>

      <div className="flex items-center gap-3 pl-3 border-l border-white/10">
        <div className="flex flex-col text-right leading-tight">
          <span className="text-[13px] text-neutral-200">{userName}</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            {typeof user?.role === 'number' ? `role ${user?.role}` : user?.role}
          </span>
        </div>
        <div className="size-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[13px] font-semibold">
          {user ? initials(userName) : '··'}
        </div>
      </div>
    </header>
  );
}
