import { cn } from '@/lib/utils';

const AVATAR = 'https://i.pinimg.com/736x/72/94/fc/7294fc15ae24bc012c69553bf7012108.jpg';

export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_10px_30px_-12px_rgba(83,80,255,0.6)]',
        className
      )}
      style={{ width: size, height: size }}
    >
      <img src={AVATAR} alt="Pierce X Hail Mery" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-brand-500/20 pointer-events-none" />
    </div>
  );
}

export function BrandLockup({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={36} />
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="font-display text-[15px] tracking-tight text-white">Pierce X Hail Mery</span>
          <span className="text-[10.5px] uppercase tracking-[0.22em] text-neutral-500">AI Ecosystem</span>
        </div>
      )}
    </div>
  );
}
