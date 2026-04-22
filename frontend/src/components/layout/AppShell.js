import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart3, Users, Wallet, Briefcase, ShieldAlert, Sparkles, Bell, UserCircle2, Settings as SettingsIcon, LogOut, Search, Globe2, Moon, Sun, Menu } from 'lucide-react';
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
        queryFn: async () => (await api.get('/notifications/unread-count')).data,
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
    return (_jsxs("div", { className: "min-h-screen bg-[#07070a] text-neutral-100 relative", children: [_jsx("div", { className: "pointer-events-none fixed inset-0 bg-radial-luxe opacity-80" }), _jsxs("div", { className: "relative flex min-h-screen", children: [_jsxs("aside", { className: cn('sticky top-0 h-screen shrink-0 flex flex-col hairline-t hairline-b border-r border-white/5 bg-[#0a0a0b]/60 backdrop-blur-xl transition-[width] duration-300', sidebarCollapsed ? 'w-[76px]' : 'w-[260px]'), children: [_jsxs("div", { className: "px-4 py-5 flex items-center justify-between", children: [_jsx(BrandLockup, { collapsed: sidebarCollapsed }), _jsx("button", { onClick: toggleSidebar, className: "p-2 rounded-lg hover:bg-white/5 text-neutral-400", "aria-label": "toggle sidebar", children: _jsx(Menu, { size: 16 }) })] }), _jsxs("nav", { className: "flex-1 px-3 overflow-y-auto", children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-neutral-600 px-3 py-2", children: !sidebarCollapsed && 'Модули' }), _jsx("ul", { className: "space-y-1", children: items.map((it) => (_jsx("li", { children: _jsxs(NavLink, { to: it.to, end: it.end, className: ({ isActive }) => cn('group flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium transition', isActive
                                                    ? 'bg-white/[0.06] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]'
                                                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'), children: [_jsx(it.icon, { size: 17, className: "shrink-0" }), !sidebarCollapsed && _jsx("span", { className: "truncate", children: it.label })] }) }, it.to))) }), _jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-neutral-600 px-3 pt-5 pb-2", children: !sidebarCollapsed && 'Аккаунт' }), _jsxs("ul", { className: "space-y-1", children: [_jsx("li", { children: _jsxs(NavLink, { to: "/notifications", className: ({ isActive }) => cn('group flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium transition', isActive ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'), children: [_jsx(Bell, { size: 17 }), !sidebarCollapsed && _jsx("span", { className: "flex-1", children: t('nav.notifications') }), unread && unread.count > 0 && (_jsx("span", { className: "text-[10px] px-1.5 py-[1px] rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30", children: unread.count }))] }) }), _jsx("li", { children: _jsxs(NavLink, { to: "/profile", className: ({ isActive }) => cn('flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium transition', isActive ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'), children: [_jsx(UserCircle2, { size: 17 }), !sidebarCollapsed && _jsx("span", { children: t('nav.profile') })] }) }), _jsx("li", { children: _jsxs(NavLink, { to: "/settings", className: ({ isActive }) => cn('flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium transition', isActive ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'), children: [_jsx(SettingsIcon, { size: 17 }), !sidebarCollapsed && _jsx("span", { children: t('nav.settings') })] }) })] })] }), _jsx("div", { className: "p-3", children: _jsxs("button", { onClick: () => {
                                        logout();
                                        nav('/auth/login');
                                    }, className: "w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[13px] text-neutral-400 hover:text-white hover:bg-white/[0.04]", children: [_jsx(LogOut, { size: 17 }), !sidebarCollapsed && _jsx("span", { children: t('nav.logout') })] }) })] }), _jsxs("main", { className: "flex-1 min-w-0 flex flex-col", children: [_jsx(Topbar, {}), _jsx("div", { className: "flex-1 px-6 py-6 lg:px-10 lg:py-8", children: _jsx(Outlet, {}) })] })] })] }));
}
function Topbar() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { theme, setTheme } = useUIStore();
    const [lang, setLang] = useState(i18n.language);
    const userName = user ? `${user.surname} ${user.name}`.trim() : '—';
    return (_jsxs("header", { className: "sticky top-0 z-30 px-6 lg:px-10 h-[68px] flex items-center gap-4 bg-[#07070a]/70 backdrop-blur-xl hairline-b", children: [_jsxs("div", { className: "flex-1 max-w-xl relative", children: [_jsx(Search, { size: 15, className: "absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" }), _jsx("input", { placeholder: t('common.search') + '…', className: "w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-white/15" })] }), _jsxs("button", { onClick: () => {
                    const next = lang === 'ru' ? 'kz' : lang === 'kz' ? 'en' : 'ru';
                    i18n.changeLanguage(next);
                    localStorage.setItem('pxhm.lang', next);
                    setLang(next);
                }, className: "h-10 px-3 rounded-xl text-xs font-medium uppercase tracking-[0.2em] text-neutral-300 border border-white/10 hover:bg-white/5 flex items-center gap-2", children: [_jsx(Globe2, { size: 14 }), lang] }), _jsx("button", { onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'), className: "h-10 w-10 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center text-neutral-300", "aria-label": "toggle theme", children: theme === 'dark' ? _jsx(Moon, { size: 15 }) : _jsx(Sun, { size: 15 }) }), _jsxs("div", { className: "flex items-center gap-3 pl-3 border-l border-white/10", children: [_jsxs("div", { className: "flex flex-col text-right leading-tight", children: [_jsx("span", { className: "text-[13px] text-neutral-200", children: userName }), _jsx("span", { className: "text-[11px] uppercase tracking-[0.18em] text-neutral-500", children: typeof user?.role === 'number' ? `role ${user?.role}` : user?.role })] }), _jsx("div", { className: "size-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[13px] font-semibold", children: user ? initials(userName) : '··' })] })] }));
}
