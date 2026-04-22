import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/brand/Logo';
import { AuroraBackground } from '@/components/AuroraBackground';
import { useTranslation } from 'react-i18next';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AuroraBackground />

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden lg:flex flex-col justify-between flex-1 p-14">
          <Link to="/" className="flex items-center gap-3 w-max">
            <BrandMark size={44} />
            <div className="flex flex-col">
              <span className="font-display text-[17px] tracking-tight">Pierce X Hail Mery</span>
              <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">AI Ecosystem</span>
            </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <h1 className="font-display text-[54px] leading-[1.02] tracking-tight text-white">
              Единый контур
              <br />
              <span className="text-brand-300">управления экосистемой.</span>
            </h1>
            <p className="mt-6 text-neutral-400 text-[15px] leading-relaxed max-w-md">
              {t('app.tagline')}. Образование, финансы, HR, карьера и цифровая безопасность —
              в одном премиум-интерфейсе. Разработано для Казахстана.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <Metric k="12" v="модулей" />
              <Metric k="5" v="AI-доменов" />
              <Metric k="RU · KZ · EN" v="интерфейс" />
            </div>
          </motion.div>

          <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-600">
            © 2025 Pierce X Hail Mery · Kazakhstan AI Hackathon
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[440px] glass elevated rounded-3xl p-8 lg:p-10 relative"
          >
            <div className="absolute -top-[1px] left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="lg:hidden flex justify-center mb-6">
              <BrandMark size={42} />
            </div>
            <div className="mb-6">
              <h2 className="font-display text-[26px] tracking-tight text-white">{title}</h2>
              {subtitle && <p className="text-[13.5px] text-neutral-400 mt-1.5">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-[13px] text-neutral-400">{footer}</div>}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-[24px] text-white">{k}</span>
      <span className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">{v}</span>
    </div>
  );
}
