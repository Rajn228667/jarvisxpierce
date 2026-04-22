import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PageHeader({ title, subtitle, actions }) {
    return (_jsxs("div", { className: "flex items-end justify-between gap-4 mb-7", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display text-[30px] leading-tight tracking-tight text-white", children: title }), subtitle && _jsx("p", { className: "text-[13.5px] text-neutral-500 mt-1.5", children: subtitle })] }), actions && _jsx("div", { className: "flex items-center gap-2", children: actions })] }));
}
