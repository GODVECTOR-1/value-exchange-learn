import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages · Swapr" }] }),
  component: MessagesIndex,
});

type Convo = { id: string; other: { user_id: string; display_name: string | null; avatar_url: string | null }; last: string | null };

function MessagesIndex() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  const loadConvos = async () => {
    if (!user) return;
    try {
      // 1. Get my matches only
      const { data: m, error: mErr } = await supabase
        .from("matches")
        .select("id, user_a, user_b")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
      if (mErr) throw mErr;

      const matchIds = (m ?? []).map((row) => row.id);
      if (matchIds.length === 0) { setConvos([]); return; }

      const others = (m ?? []).map((row) => (row.user_a === user.id ? row.user_b : row.user_a));

      // 2. Fetch profiles + ALL messages for ONLY my match_ids in parallel (RLS also enforces this)
      const [{ data: profiles }, { data: allMsgs, error: msgErr }] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", others),
        supabase
          .from("messages")
          .select("match_id, content, created_at")
          .in("match_id", matchIds)
          .order("created_at", { ascending: false }),
      ]);
      if (msgErr) throw msgErr;

      const pmap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      // Reduce to last message per match (first occurrence due to DESC order)
      const lastByMatch = new Map<string, string>();
      for (const msg of allMsgs ?? []) {
        if (!lastByMatch.has(msg.match_id)) lastByMatch.set(msg.match_id, msg.content);
      }

      const list: Convo[] = (m ?? []).map((row) => {
        const otherId = row.user_a === user.id ? row.user_b : row.user_a;
        return {
          id: row.id,
          other: pmap.get(otherId) ?? { user_id: otherId, display_name: null, avatar_url: null },
          last: lastByMatch.get(row.id) ?? null,
        };
      });
      setConvos(list);
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadConvos();
    // Realtime: refresh inbox when any new message arrives
    const ch = supabase
      .channel(`inbox:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => loadConvos())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  if (authLoading || loading) return <AppLayout><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-3xl font-display font-bold mb-6">Messages</h1>
        {convos.length === 0 ? (
          <div className="bg-card rounded-3xl p-10 text-center border border-border">
            <MessageSquare className="w-12 h-12 mx-auto text-primary mb-3" />
            <h2 className="font-display font-bold text-xl">No conversations yet</h2>
            <p className="text-muted-foreground text-sm mt-2">Match with someone to start chatting.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {convos.map((c) => (
              <Link key={c.id} to="/messages/$matchId" params={{ matchId: c.id }} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border hover:shadow-soft transition">
                <div className="w-12 h-12 rounded-2xl bg-gradient-hero overflow-hidden flex-shrink-0">
                  {c.other.avatar_url ? <img src={c.other.avatar_url} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-primary-foreground font-display font-bold">{(c.other.display_name ?? "?").charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.other.display_name ?? "Student"}</div>
                  <div className="text-sm text-muted-foreground truncate">{c.last ?? "Say hi 👋"}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
