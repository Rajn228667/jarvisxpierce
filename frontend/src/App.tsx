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
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#07070a]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 rounded-full border-2 border-white/10 border-t-brand-400 animate-spin" />
        <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">Loading</span>
      </div>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  if (!token) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function Public({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <Suspense fallback={<LoadingShell />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname.split('/')[1] || 'root'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          <Routes location={location}>
            <Route path="/auth/login" element={<Public><LoginPage /></Public>} />
            <Route path="/auth/register" element={<Public><RegisterPage /></Public>} />
            <Route path="/auth/verify" element={<Public><VerifyEmailPage /></Public>} />
            <Route path="/auth/forgot" element={<Public><ForgotPasswordPage /></Public>} />
            <Route path="/auth/reset" element={<Public><ResetPasswordPage /></Public>} />

            <Route
              path="/"
              element={
                <Protected>
                  <AppShell />
                </Protected>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="vacancies" element={<VacanciesPage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="ai" element={<AIAssistantPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}
