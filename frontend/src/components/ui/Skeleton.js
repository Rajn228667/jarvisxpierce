import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function Skeleton({ className, ...rest }) {
    return _jsx("div", { className: cn('shimmer rounded-lg h-4 w-full', className), ...rest });
}
