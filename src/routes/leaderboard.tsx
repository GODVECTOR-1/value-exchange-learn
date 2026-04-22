import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trophy, Flame } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard · Swapr" }] }),
  component: LeaderboardPage,
});

type Row = { user_id: string; display_name: string | null; avatar_url: string | null; xp: number; streak: number };

function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url, xp, streak").order("xp", { ascending: false }).limit(50);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <AppLayout><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-warning" />
          <div>
            <h1 className="text-3xl font-display font-bold">Leaderboard</h1>
            <p className="text-muted-foreground text-sm">Top learners by XP this season.</p>
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.user_id} className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold ${i === 0 ? "bg-gradient-sun text-foreground" : i === 1 ? "bg-muted" : i === 2 ? "bg-gradient-mint text-secondary-foreground" : "bg-muted/50"}`}>
                {i + 1}
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-hero overflow-hidden flex-shrink-0">
                {r.avatar_url ? <img src={r.avatar_url} alt="" className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-primary-foreground font-display font-bold">{(r.display_name ?? "?").charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="flex-1 min-w-0 font-semibold truncate">{r.display_name ?? "Student"}</div>
              <div className="flex items-center gap-1 text-sm font-semibold text-hot"><Flame className="w-4 h-4" /> {r.streak}</div>
              <div className="text-sm font-display font-bold tabular-nums">{r.xp} XP</div>
            </div>
          ))}
          {rows.length === 0 && <div className="text-center text-muted-foreground py-12">No data yet — start learning to climb the board!</div>}
        </div>
      </div>
    </AppLayout>
  );
}
