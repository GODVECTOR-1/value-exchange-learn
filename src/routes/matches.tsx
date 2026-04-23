import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MessageSquare, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/matches")({
  head: () => ({ meta: [{ title: "Matches · Swapr" }] }),
  component: MatchesPage,
});

type Match = {
  id: string;
  other: { user_id: string; display_name: string | null; avatar_url: string | null; skills_offered: string[] };
};

function MatchesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: m, error } = await supabase.from("matches").select("*").or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
        if (error) throw error;
        const others = (m ?? []).map((row) => (row.user_a === user.id ? row.user_b : row.user_a));
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url, skills_offered").in("user_id", others.length ? others : ["00000000-0000-0000-0000-000000000000"]);
        const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));
        const merged: Match[] = (m ?? []).map((row) => {
          const otherId = row.user_a === user.id ? row.user_b : row.user_a;
          const other = map.get(otherId) ?? { user_id: otherId, display_name: null, avatar_url: null, skills_offered: [] };
          return { id: row.id, other };
        });
        setMatches(merged);
      } catch (err: any) {
        toast.error(err?.message ?? "Couldn't load matches.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (authLoading || loading) return <AppLayout><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-3xl font-display font-bold mb-1">Your matches</h1>
        <p className="text-muted-foreground text-sm mb-6">{matches.length} mutual likes — start chatting!</p>

        {matches.length === 0 ? (
          <div className="bg-card rounded-3xl p-10 text-center border border-border">
            <Heart className="w-12 h-12 mx-auto text-primary mb-3" />
            <h2 className="font-display font-bold text-xl">No matches yet</h2>
            <p className="text-muted-foreground text-sm mt-2 mb-6">Swipe in Discover to find your skill-swap partner.</p>
            <Link to="/discover" className="inline-flex px-5 py-2.5 rounded-full bg-foreground text-background font-semibold">Start swiping</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {matches.map((m) => (
              <Link key={m.id} to="/messages/$matchId" params={{ matchId: m.id }} className="bg-card rounded-2xl p-4 border border-border hover:shadow-pop transition-shadow flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-hero overflow-hidden flex-shrink-0">
                  {m.other.avatar_url ? (
                    <img src={m.other.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-foreground font-display font-bold text-xl">{(m.other.display_name ?? "?").charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{m.other.display_name ?? "Student"}</div>
                  <div className="text-xs text-muted-foreground truncate">Teaches: {m.other.skills_offered.slice(0, 3).join(", ") || "—"}</div>
                </div>
                <MessageSquare className="w-5 h-5 text-primary" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
