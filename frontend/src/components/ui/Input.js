import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
export const Input = forwardRef(({ className, label, hint, error, icon, id, ...rest }, ref) => {
    const inputId = id || rest.name || Math.random().toString(36).slice(2);
    return (_jsxs("div", { className: "flex flex-col gap-1.5 w-full", children: [label && (_jsx("label", { htmlFor: inputId, className: "text-[12px] font-medium tracking-wide text-neutral-400", children: label })), _jsxs("div", { className: "relative", children: [icon && (_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none", children: icon })), _jsx("input", { id: inputId, ref: ref, className: cn('w-full h-11 rounded-xl bg-white/[0.03] border border-white/[0.07] px-3 text-sm text-neutral-100 placeholder:text-neutral-500', 'focus:outline-none focus:border-brand-500/60 focus:bg-white/[0.05] transition', 'ring-brand', icon && 'pl-10', error && 'border-red-500/60 focus:border-red-500', className), ...rest })] }), (hint || error) && (_jsx("p", { className: cn('text-[11px]', error ? 'text-red-400' : 'text-neutral-500'), children: error || hint }))] }));
});
Input.displayName = 'Input';
