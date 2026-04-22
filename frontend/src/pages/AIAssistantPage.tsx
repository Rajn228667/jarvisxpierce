import { FormEvent, useEffect, useRef, useState } from 'react';
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

type ChatSummary = {
  id: string;
  title: string;
  model: string;
  contextTag: string | null;
  updatedAt: string;
  messageCount: number;
};

type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt: string;
};

type ChatDetail = {
  summary: ChatSummary;
  messages: Message[];
};

export default function AIAssistantPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const chats = useQuery({
    queryKey: ['ai-chats'],
    queryFn: async () => (await api.get('/ai/chats')).data as ChatSummary[]
  });

  const detail = useQuery({
    queryKey: ['ai-chat', activeId],
    enabled: !!activeId,
    queryFn: async () => (await api.get(`/ai/chats/${activeId}`)).data as ChatDetail
  });

  useEffect(() => {
    if (!activeId && chats.data && chats.data.length > 0) setActiveId(chats.data[0].id);
  }, [chats.data, activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [detail.data]);

  const createChat = useMutation({
    mutationFn: async () =>
      (await api.post('/ai/chats', { title: 'Новый чат' })).data as ChatDetail,
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['ai-chats'] });
      setActiveId(c.summary.id);
    }
  });

  const send = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) =>
      (await api.post(`/ai/chats/${id}/messages`, { content })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-chat', activeId] });
      qc.invalidateQueries({ queryKey: ['ai-chats'] });
      setInput('');
    },
    onError: (e) => toast.error(extractError(e))
  });

  const del = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/ai/chats/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-chats'] });
      if (activeId) setActiveId(null);
    }
  });

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
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

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-140px)]">
      <PageHeader
        title={t('ai.title')}
        subtitle={t('ai.subtitle')}
        actions={
          <Button
            size="sm"
            variant="subtle"
            onClick={() => createChat.mutate()}
            loading={createChat.isPending}
          >
            <Plus size={14} /> {t('ai.new')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4 flex-1 min-h-[500px]">
        <Card className="!p-3 flex flex-col">
          <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 px-2 pt-1 pb-2">
            Чаты
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1">
            {chats.data?.length === 0 && (
              <div className="p-4 text-center text-[12px] text-neutral-500">Нет чатов</div>
            )}
            {chats.data?.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  'text-left w-full px-3 py-2 rounded-lg text-[13px] group flex items-start justify-between gap-2 transition',
                  activeId === c.id
                    ? 'bg-white/[0.06] text-white'
                    : 'text-neutral-400 hover:bg-white/[0.03] hover:text-neutral-200'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate">{c.title}</div>
                  <div className="text-[10.5px] uppercase tracking-[0.18em] text-neutral-600">
                    {fmtDate(c.updatedAt, true)}
                  </div>
                </div>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    del.mutate(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col !p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4" ref={scrollRef}>
            {!activeId && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="size-12 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-300">
                  <Sparkles size={20} />
                </div>
                <div className="max-w-md">
                  <h3 className="font-display text-[22px] tracking-tight text-white">
                    AI-ассистент Pierce X
                  </h3>
                  <p className="text-[13px] text-neutral-400 mt-1">
                    Задавайте вопросы на русском, казахском или английском. Ассистент понимает
                    вашу экосистему.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-xl">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s)}
                      className="glass glass-hover rounded-xl px-3 py-3 text-left text-[12.5px] text-neutral-300 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {detail.data?.messages
              ?.filter((m) => m.role !== 'system')
              .map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'ml-auto bg-brand-500/15 border border-brand-500/25 text-neutral-100'
                      : 'mr-auto glass text-neutral-200'
                  )}
                >
                  {m.content}
                </motion.div>
              ))}
            {send.isPending && (
              <div className="mr-auto glass rounded-2xl px-4 py-3 text-[13.5px] text-neutral-400">
                AI думает…
              </div>
            )}
          </div>

          <form onSubmit={onSend} className="hairline-t p-4 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.placeholder')}
              className="flex-1 h-11 px-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-brand-500/60"
            />
            <Button type="submit" loading={send.isPending} disabled={!input.trim()}>
              <Send size={14} /> {t('ai.send')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
