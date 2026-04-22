import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
const tones = {
    neutral: 'bg-white/5 text-neutral-300 border-white/10',
    brand: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    warn: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    danger: 'bg-red-500/10 text-red-300 border-red-500/25',
    gold: 'bg-[#d4af6a]/10 text-[#d4af6a] border-[#d4af6a]/25'
};
export function Badge({ tone = 'neutral', className, ...rest }) {
    return (_jsx("span", { className: cn('inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[11px] font-medium border', tones[tone], className), ...rest }));
}
