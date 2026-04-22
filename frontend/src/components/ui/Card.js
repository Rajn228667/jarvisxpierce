import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function Card({ className, ...rest }) {
    return (_jsx("div", { className: cn('glass elevated rounded-2xl p-5 relative overflow-hidden', className), ...rest }));
}
export function CardHeader({ className, ...rest }) {
    return _jsx("div", { className: cn('flex items-start justify-between gap-3 mb-3', className), ...rest });
}
export function CardTitle({ className, ...rest }) {
    return _jsx("h3", { className: cn('text-[13px] uppercase tracking-[0.18em] text-neutral-400 font-medium', className), ...rest });
}
