import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Code2, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/learn/collab/$matchId")({
  head: () => ({ meta: [{ title: "Collab Code · Swapr" }] }),
  component: CollabPage,
});

const LANGS = [
  { id: "javascript", label: "JavaScript", version: "18.15.0", sample: '// Pair coding with your match!\nconst hello = (n) => `Hi ${n}`;\nconsole.log(hello("Swapr"));' },
  { id: "python", label: "Python", version: "3.10.0", sample: '# Pair coding with your match!\nname = "Swapr"\nprint(f"Hello from {name}!")' },
  { id: "typescript", label: "TypeScript", version: "5.0.3", sample: 'const greet = (n: string): string => `Hi ${n}`;\nconsole.log(greet("Swapr"));' },
  { id: "rust", label: "Rust", version: "1.68.2", sample: 'fn main(){ println!("Hello, Swapr!"); }' },
  { id: "go", label: "Go", version: "1.16.2", sample: 'package main\nimport "fmt"\nfunc main(){ fmt.Println("Hello, Swapr!") }' },
];

function CollabPage() {
  const { matchId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(LANGS[0]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [peerEditing, setPeerEditing] = useState(false);
  const localUpdate = useRef(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  // Initial fetch / create row
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        // Verify match membership
        const { data: m, error: mErr } = await supabase.from("matches").select("id").eq("id", matchId).maybeSingle();
        if (mErr || !m) { toast.error("Match not found"); navigate({ to: "/matches" }); return; }

        const { data: existing } = await supabase
          .from("code_sessions").select("*").eq("match_id", matchId).maybeSingle();

        if (existing) {
          if (cancelled) return;
          const found = LANGS.find((l) => l.id === existing.language) ?? LANGS[0];
          setLang(found);
          setCode(existing.content ?? "");
        } else {
          const seed = LANGS[0];
          const { data: created, error: cErr } = await supabase
            .from("code_sessions")
            .insert({ match_id: matchId, language: seed.id, content: seed.sample, updated_by: user.id })
            .select().single();
          if (cErr) throw cErr;
          if (cancelled) return;
          setLang(seed);
          setCode(created?.content ?? seed.sample);
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to load workspace");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, matchId, navigate]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`code_session:${matchId}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "code_sessions", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as { content: string; language: string; updated_by: string };
          if (row.updated_by === user.id) return; // skip own updates
          const found = LANGS.find((l) => l.id === row.language) ?? LANGS[0];
          setLang(found);
          setCode(row.content ?? "");
          setPeerEditing(true);
          setTimeout(() => setPeerEditing(false), 1200);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, matchId]);

  // Debounced push of local edits
  const pushUpdate = (next: { content?: string; language?: string }) => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (!user) return;
      try {
        const { error } = await supabase
          .from("code_sessions")
          .update({ ...next, updated_by: user.id })
          .eq("match_id", matchId);
        if (error) throw error;
      } catch (err: any) {
        toast.error("Sync failed");
      }
    }, 250);
  };

  const onCodeChange = (val: string) => {
    setCode(val);
    localUpdate.current = true;
    pushUpdate({ content: val });
  };

  const onLangChange = (id: string) => {
    const next = LANGS.find((l) => l.id === id)!;
    setLang(next);
    pushUpdate({ language: next.id });
  };

  const run = async () => {
    setRunning(true); setOutput("Running…");
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang.id, version: lang.version, files: [{ content: code }] }),
      });
      const data = await res.json();
      const out = (data.run?.stdout ?? "") + (data.run?.stderr ? `\n[stderr]\n${data.run.stderr}` : "");
      setOutput(out || "(no output)");
    } catch (e: any) {
      toast.error("Execution failed");
      setOutput(`Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  if (authLoading || loading) {
    return <AppLayout><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Link to="/messages/$matchId" params={{ matchId }} className="p-2 rounded-full hover:bg-muted"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center"><Code2 className="w-5 h-5 text-primary-foreground" /></div>
          <h1 className="text-xl sm:text-2xl font-display font-bold flex-1">Pair Coding</h1>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 ${peerEditing ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Users className="w-3.5 h-3.5" /> {peerEditing ? "Peer editing…" : "Live"}
          </span>
          <Select value={lang.id} onValueChange={onLangChange}>
            <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>{LANGS.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={run} disabled={running} className="relative z-10 rounded-full bg-foreground text-background hover:bg-foreground/90">
            {running ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1" />} Run
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border bg-muted/40 flex justify-between">
              <span>Editor · {lang.label}</span>
              <span className="text-primary">●  syncing in real-time</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[24rem] p-4 font-mono text-sm bg-transparent outline-none resize-y"
            />
          </div>
          <div className="bg-foreground text-background rounded-2xl overflow-hidden">
            <div className="px-4 py-2 text-xs font-semibold border-b border-background/20">Output</div>
            <pre className="p-4 font-mono text-sm whitespace-pre-wrap min-h-[24rem] max-h-[32rem] overflow-auto">{output || "Hit Run to execute together."}</pre>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">Both you and your match can edit. Changes sync in real-time.</p>
      </div>
    </AppLayout>
  );
}
