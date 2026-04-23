import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mic, MicOff, Video, VideoOff, Send, ArrowLeft, Languages, Plus, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/learn/live/$matchId")({
  head: () => ({ meta: [{ title: "Live Lesson · Swapr" }] }),
  component: LiveLesson,
});

type Message = { id: string; sender_id: string; content: string; created_at: string };

function LiveLesson() {
  const { matchId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [other, setOther] = useState<{ user_id: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [vocab, setVocab] = useState<{ term: string; meaning: string }[]>([]);
  const [vTerm, setVTerm] = useState("");
  const [vMeaning, setVMeaning] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: m } = await supabase.from("matches").select("*").eq("id", matchId).maybeSingle();
        if (!m) { toast.error("Match not found"); navigate({ to: "/matches" }); return; }
        const otherId = m.user_a === user.id ? m.user_b : m.user_a;
        const { data: p } = await supabase.from("profiles").select("user_id, display_name, avatar_url").eq("user_id", otherId).maybeSingle();
        setOther(p ?? { user_id: otherId, display_name: null, avatar_url: null });
        const { data: msgs } = await supabase.from("messages").select("*").eq("match_id", matchId).order("created_at");
        setMessages(msgs ?? []);
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    })();

    const ch = supabase
      .channel(`live:${matchId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, matchId, navigate]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!user || !input.trim()) return;
    const content = input.trim().slice(0, 2000);
    setInput("");
    try {
      const { error } = await supabase.from("messages").insert({ match_id: matchId, sender_id: user.id, content });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't send");
    }
  };

  const addVocab = () => {
    if (!vTerm.trim() || !vMeaning.trim()) return;
    setVocab((v) => [...v, { term: vTerm.trim(), meaning: vMeaning.trim() }]);
    setVTerm(""); setVMeaning("");
  };

  if (authLoading || loading) return <AppLayout><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  const initial = (other?.display_name ?? "?").charAt(0).toUpperCase();

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Link to="/messages/$matchId" params={{ matchId }} className="p-2 rounded-full hover:bg-muted"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-mint flex items-center justify-center"><Languages className="w-5 h-5 text-secondary-foreground" /></div>
          <h1 className="text-xl sm:text-2xl font-display font-bold flex-1">Live language lesson</h1>
          <span className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground font-semibold">● live</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Video stage */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-gradient-hero flex items-center justify-center">
              {camOff ? (
                <div className="text-center text-primary-foreground/90">
                  <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-80" />
                  <div className="text-sm">Camera off</div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-background/20 backdrop-blur flex items-center justify-center text-primary-foreground font-display font-bold text-5xl">
                  {other?.avatar_url ? <img src={other.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : initial}
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-background/70 backdrop-blur text-xs font-semibold">
                {other?.display_name ?? "Partner"}
              </div>
              <div className="absolute bottom-3 right-3 w-24 sm:w-32 aspect-video rounded-2xl bg-foreground/80 border-2 border-background flex items-center justify-center text-background text-xs font-semibold">
                You
              </div>
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              <Button onClick={() => setMuted(!muted)} variant={muted ? "default" : "outline"}
                className={`relative z-10 rounded-full h-12 w-12 p-0 ${muted ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`} title={muted ? "Unmute" : "Mute"}>
                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button onClick={() => setCamOff(!camOff)} variant={camOff ? "default" : "outline"}
                className={`relative z-10 rounded-full h-12 w-12 p-0 ${camOff ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`} title={camOff ? "Show camera" : "Hide camera"}>
                {camOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">UI preview · live A/V handshake comes next.</p>
          </div>

          {/* Sidebar: chat + vocab */}
          <div className="space-y-4">
            <div className="bg-card rounded-3xl border border-border flex flex-col h-80">
              <div className="px-4 py-2 text-xs font-semibold border-b border-border bg-muted/40">Live chat</div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && <div className="text-center text-xs text-muted-foreground py-8">Say hi 👋</div>}
                {messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-3 py-1.5 rounded-2xl text-sm ${mine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>{m.content}</div>
                    </div>
                  );
                })}
              </div>
              <div className="p-2 border-t border-border flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Message…" className="rounded-full h-9 text-sm" maxLength={2000} />
                <Button onClick={send} disabled={!input.trim()} size="sm" className="rounded-full h-9 w-9 p-0 bg-foreground text-background hover:bg-foreground/90"><Send className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border p-4">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Vocabulary notes</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {vocab.length === 0 && <div className="text-xs text-muted-foreground">Pin new words below.</div>}
                {vocab.map((v, i) => (
                  <div key={i} className="flex items-start gap-2 bg-muted/40 rounded-xl px-3 py-1.5 text-sm">
                    <div className="flex-1 min-w-0"><span className="font-semibold">{v.term}</span> <span className="text-muted-foreground">— {v.meaning}</span></div>
                    <button onClick={() => setVocab(vocab.filter((_, k) => k !== i))} className="opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Input value={vTerm} onChange={(e) => setVTerm(e.target.value)} placeholder="Word" className="rounded-xl h-9 text-sm" />
                <Input value={vMeaning} onChange={(e) => setVMeaning(e.target.value)} placeholder="Meaning" className="rounded-xl h-9 text-sm" />
              </div>
              <Button onClick={addVocab} variant="outline" size="sm" className="w-full mt-2 rounded-full"><Plus className="w-3.5 h-3.5 mr-1" /> Pin word</Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
