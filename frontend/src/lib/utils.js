import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function fmtNumber(n, digits = 0) {
    if (n === null || n === undefined || Number.isNaN(n))
        return '—';
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}
export function fmtCurrency(n) {
    if (n === null || n === undefined || Number.isNaN(n))
        return '—';
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(n);
}
export function fmtPercent(n, digits = 1) {
    if (n === null || n === undefined)
        return '—';
    return `${n.toFixed(digits)}%`;
}
export function fmtDate(d, withTime = false) {
    if (!d)
        return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    const opts = withTime
        ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: 'short', year: 'numeric' };
    return new Intl.DateTimeFormat('ru-RU', opts).format(date);
}
export function getDeviceFingerprint() {
    let fp = localStorage.getItem('pxhm.fp');
    if (!fp) {
        fp =
            'fp-' +
                Math.random().toString(36).slice(2) +
                Date.now().toString(36) +
                (navigator.userAgent.length.toString(36) || '');
        localStorage.setItem('pxhm.fp', fp);
    }
    return fp;
}
export function initials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');
}
