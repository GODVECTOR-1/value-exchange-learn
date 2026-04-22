import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageSquare } from "lucide-react";

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

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: m } = await supabase.from("matches").select("*").or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
      const others = (m ?? []).map((row) => (row.user_a === user.id ? row.user_b : row.user_a));
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", others.length ? others : ["00000000-0000-0000-0000-000000000000"]);
      const pmap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      const list: Convo[] = [];
      for (const row of m ?? []) {
        const otherId = row.user_a === user.id ? row.user_b : row.user_a;
        const { data: msg } = await supabase.from("messages").select("content").eq("match_id", row.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        list.push({ id: row.id, other: pmap.get(otherId) ?? { user_id: otherId, display_name: null, avatar_url: null }, last: msg?.content ?? null });
      }
      setConvos(list);
      setLoading(false);
    })();
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
