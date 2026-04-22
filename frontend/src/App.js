import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { AppShell } from '@/components/layout/AppShell';
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const StudentsPage = lazy(() => import('@/pages/StudentsPage'));
const FinancePage = lazy(() => import('@/pages/FinancePage'));
const VacanciesPage = lazy(() => import('@/pages/VacanciesPage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));
const AIAssistantPage = lazy(() => import('@/pages/AIAssistantPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
function LoadingShell() {
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-[#07070a]", children: _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("div", { className: "size-10 rounded-full border-2 border-white/10 border-t-brand-400 animate-spin" }), _jsx("span", { className: "text-xs uppercase tracking-[0.3em] text-neutral-500", children: "Loading" })] }) }));
}
function Protected({ children }) {
    const token = useAuthStore((s) => s.accessToken);
    const location = useLocation();
    if (!token)
        return _jsx(Navigate, { to: "/auth/login", state: { from: location }, replace: true });
    return _jsx(_Fragment, { children: children });
}
function Public({ children }) {
    const token = useAuthStore((s) => s.accessToken);
    if (token)
        return _jsx(Navigate, { to: "/", replace: true });
    return _jsx(_Fragment, { children: children });
}
export default function App() {
    const location = useLocation();
    const theme = useUIStore((s) => s.theme);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    return (_jsx(Suspense, { fallback: _jsx(LoadingShell, {}), children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, className: "min-h-screen", children: _jsxs(Routes, { location: location, children: [_jsx(Route, { path: "/auth/login", element: _jsx(Public, { children: _jsx(LoginPage, {}) }) }), _jsx(Route, { path: "/auth/register", element: _jsx(Public, { children: _jsx(RegisterPage, {}) }) }), _jsx(Route, { path: "/auth/verify", element: _jsx(Public, { children: _jsx(VerifyEmailPage, {}) }) }), _jsx(Route, { path: "/auth/forgot", element: _jsx(Public, { children: _jsx(ForgotPasswordPage, {}) }) }), _jsx(Route, { path: "/auth/reset", element: _jsx(Public, { children: _jsx(ResetPasswordPage, {}) }) }), _jsxs(Route, { path: "/", element: _jsx(Protected, { children: _jsx(AppShell, {}) }), children: [_jsx(Route, { index: true, element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "students", element: _jsx(StudentsPage, {}) }), _jsx(Route, { path: "finance", element: _jsx(FinancePage, {}) }), _jsx(Route, { path: "vacancies", element: _jsx(VacanciesPage, {}) }), _jsx(Route, { path: "security", element: _jsx(SecurityPage, {}) }), _jsx(Route, { path: "ai", element: _jsx(AIAssistantPage, {}) }), _jsx(Route, { path: "notifications", element: _jsx(NotificationsPage, {}) }), _jsx(Route, { path: "profile", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }, location.pathname.split('/')[1] || 'root') }) }));
}
