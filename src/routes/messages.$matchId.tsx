import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, ArrowLeft, Calendar, Code2, Video } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/messages/$matchId")({
  head: () => ({ meta: [{ title: "Chat · Swapr" }] }),
  component: ChatPage,
});

type Message = { id: string; sender_id: string; content: string; created_at: string };

function ChatPage() {
  const { matchId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<{ user_id: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: m } = await supabase.from("matches").select("*").eq("id", matchId).maybeSingle();
      if (!m) { toast.error("Match not found"); navigate({ to: "/matches" }); return; }
      const otherId = m.user_a === user.id ? m.user_b : m.user_a;
      const { data: p } = await supabase.from("profiles").select("user_id, display_name, avatar_url").eq("user_id", otherId).maybeSingle();
      setOther(p ?? { user_id: otherId, display_name: null, avatar_url: null });
      const { data: msgs } = await supabase.from("messages").select("*").eq("match_id", matchId).order("created_at");
      setMessages(msgs ?? []);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, matchId, navigate]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!user || !input.trim()) return;
    const content = input.trim().slice(0, 2000);
    setInput("");
    const { error } = await supabase.from("messages").insert({ match_id: matchId, sender_id: user.id, content });
    if (error) toast.error(error.message);
  };

  if (authLoading || loading) return <AppLayout><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <Link to="/messages" className="p-2 -ml-2 rounded-full hover:bg-muted"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-10 h-10 rounded-2xl bg-gradient-hero overflow-hidden">
            {other?.avatar_url ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center text-primary-foreground font-display font-bold">{(other?.display_name ?? "?").charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{other?.display_name ?? "Student"}</div>
          </div>
          <Link to="/learn/collab/$matchId" params={{ matchId }} className="p-2 rounded-full hover:bg-muted" title="Pair coding"><Code2 className="w-5 h-5" /></Link>
          <Link to="/learn/live/$matchId" params={{ matchId }} className="p-2 rounded-full hover:bg-muted" title="Live lesson"><Video className="w-5 h-5" /></Link>
          <Link to="/sessions" className="p-2 rounded-full hover:bg-muted" title="Schedule session"><Calendar className="w-5 h-5" /></Link>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-2">
          {messages.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">Start the conversation 👋</div>}
          {messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${mine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-3 border-t border-border">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Type a message..."
            maxLength={2000}
            className="rounded-full"
          />
          <Button onClick={send} disabled={!input.trim()} className="rounded-full bg-foreground text-background hover:bg-foreground/90"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </AppLayout>
  );
}
