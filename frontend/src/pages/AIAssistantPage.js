import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, Send, Sparkles, Trash2 } from 'lucide-react';
import { api, extractError } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn, fmtDate } from '@/lib/utils';
export default function AIAssistantPage() {
    const { t } = useTranslation();
    const qc = useQueryClient();
    const [activeId, setActiveId] = useState(null);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);
    const chats = useQuery({
        queryKey: ['ai-chats'],
        queryFn: async () => (await api.get('/ai/chats')).data
    });
    const detail = useQuery({
        queryKey: ['ai-chat', activeId],
        enabled: !!activeId,
        queryFn: async () => (await api.get(`/ai/chats/${activeId}`)).data
    });
    useEffect(() => {
        if (!activeId && chats.data && chats.data.length > 0)
            setActiveId(chats.data[0].id);
    }, [chats.data, activeId]);
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [detail.data]);
    const createChat = useMutation({
        mutationFn: async () => (await api.post('/ai/chats', { title: 'Новый чат' })).data,
        onSuccess: (c) => {
            qc.invalidateQueries({ queryKey: ['ai-chats'] });
            setActiveId(c.summary.id);
        }
    });
    const send = useMutation({
        mutationFn: async ({ id, content }) => (await api.post(`/ai/chats/${id}/messages`, { content })).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ai-chat', activeId] });
            qc.invalidateQueries({ queryKey: ['ai-chats'] });
            setInput('');
        },
        onError: (e) => toast.error(extractError(e))
    });
    const del = useMutation({
        mutationFn: async (id) => (await api.delete(`/ai/chats/${id}`)).data,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ai-chats'] });
            if (activeId)
                setActiveId(null);
        }
    });
    const onSend = async (e) => {
        e.preventDefault();
        if (!input.trim())
            return;
        let id = activeId;
        if (!id) {
            const c = await createChat.mutateAsync();
            id = c.summary.id;
        }
        send.mutate({ id, content: input });
    };
    const suggestions = [
        'Какие студенты имеют высокий риск отчисления?',
        'Покажи задолженность по направлениям',
        'Сравни посещаемость по курсам',
        'Какие домены были добавлены в чёрный список сегодня?'
    ];
    return (_jsxs("div", { className: "flex flex-col gap-6 min-h-[calc(100vh-140px)]", children: [_jsx(PageHeader, { title: t('ai.title'), subtitle: t('ai.subtitle'), actions: _jsxs(Button, { size: "sm", variant: "subtle", onClick: () => createChat.mutate(), loading: createChat.isPending, children: [_jsx(Plus, { size: 14 }), " ", t('ai.new')] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 flex-1 min-h-[500px]", children: [_jsxs(Card, { className: "!p-3 flex flex-col", children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.22em] text-neutral-500 px-2 pt-1 pb-2", children: "\u0427\u0430\u0442\u044B" }), _jsxs("div", { className: "flex-1 overflow-y-auto flex flex-col gap-1", children: [chats.data?.length === 0 && (_jsx("div", { className: "p-4 text-center text-[12px] text-neutral-500", children: "\u041D\u0435\u0442 \u0447\u0430\u0442\u043E\u0432" })), chats.data?.map((c) => (_jsxs("button", { onClick: () => setActiveId(c.id), className: cn('text-left w-full px-3 py-2 rounded-lg text-[13px] group flex items-start justify-between gap-2 transition', activeId === c.id
                                            ? 'bg-white/[0.06] text-white'
                                            : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'), children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "truncate", children: c.title }), _jsx("div", { className: "text-[10.5px] uppercase tracking-[0.18em] text-neutral-600", children: fmtDate(c.updatedAt, true) })] }), _jsx("span", { role: "button", onClick: (e) => {
                                                    e.stopPropagation();
                                                    del.mutate(c.id);
                                                }, className: "opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400", children: _jsx(Trash2, { size: 13 }) })] }, c.id)))] })] }), _jsxs(Card, { className: "flex flex-col !p-0 overflow-hidden", children: [_jsxs("div", { className: "flex-1 overflow-y-auto p-6 flex flex-col gap-4", ref: scrollRef, children: [!activeId && (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center gap-4", children: [_jsx("div", { className: "size-12 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-300", children: _jsx(Sparkles, { size: 20 }) }), _jsxs("div", { className: "max-w-md", children: [_jsx("h3", { className: "font-display text-[22px] tracking-tight text-white", children: "AI-\u0430\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442 Pierce X" }), _jsx("p", { className: "text-[13px] text-neutral-400 mt-1", children: "\u0417\u0430\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C, \u043A\u0430\u0437\u0430\u0445\u0441\u043A\u043E\u043C \u0438\u043B\u0438 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u043E\u043C. \u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442 \u043F\u043E\u043D\u0438\u043C\u0430\u0435\u0442 \u0432\u0430\u0448\u0443 \u044D\u043A\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0443." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 max-w-xl", children: suggestions.map((s, i) => (_jsx("button", { onClick: () => setInput(s), className: "glass glass-hover rounded-xl px-3 py-3 text-left text-[12.5px] text-neutral-300 hover:text-white", children: s }, i))) })] })), detail.data?.messages
                                        ?.filter((m) => m.role !== 'system')
                                        .map((m) => (_jsx(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, className: cn('max-w-[75%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap', m.role === 'user'
                                            ? 'ml-auto bg-brand-500/15 border border-brand-500/25 text-neutral-100'
                                            : 'mr-auto glass text-neutral-200'), children: m.content }, m.id))), send.isPending && (_jsx("div", { className: "mr-auto glass rounded-2xl px-4 py-3 text-[13.5px] text-neutral-400", children: "AI \u0434\u0443\u043C\u0430\u0435\u0442\u2026" }))] }), _jsxs("form", { onSubmit: onSend, className: "hairline-t p-4 flex items-center gap-2", children: [_jsx("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: t('ai.placeholder'), className: "flex-1 h-11 px-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-brand-500/60" }), _jsxs(Button, { type: "submit", loading: send.isPending, disabled: !input.trim(), children: [_jsx(Send, { size: 14 }), " ", t('ai.send')] })] })] })] })] }));
}
