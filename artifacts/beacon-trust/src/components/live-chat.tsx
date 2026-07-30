import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

type Msg = { role: 'user' | 'assistant'; content: string };

const STORAGE_KEY = 'beacon_live_chat_v1';

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setSending(true);
    try {
      const data = await apiFetch<{ reply: string }>('/api/support/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      setMessages([...next, { role: 'assistant', content: data.reply ?? "Sorry, I couldn't respond right now." }]);
    } catch (e: any) {
      setMessages([...next, { role: 'assistant', content: `Sorry — I'm having trouble connecting. ${e?.message ?? ''}` }]);
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[60] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 transition-transform flex items-center justify-center"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-[60] w-[calc(100vw-2.5rem)] sm:w-96 h-[560px] max-h-[80vh] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div>
              <div className="font-semibold text-sm">Beacon Trust Concierge</div>
              <div className="text-[11px] opacity-80">Support · Online</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-white/10" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/40">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground text-center pt-8">
                <p className="font-medium text-foreground">Hi there 👋</p>
                <p className="mt-1">Ask me about accounts, transfers, cards, loans, or how our platform works.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'
                }`}>{m.content}</div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-3 py-2 rounded-2xl text-sm flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type your message…"
                className="flex-1 resize-none bg-muted/40 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 max-h-32"
              />
              <Button onClick={send} disabled={!input.trim() || sending} size="icon" className="h-9 w-9 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">Never share passwords, PINs, or one-time codes.</p>
          </div>
        </div>
      )}
    </>
  );
}
