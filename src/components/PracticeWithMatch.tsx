import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Users, Heart } from "lucide-react";
import { toast } from "sonner";

type Other = { user_id: string; display_name: string | null; avatar_url: string | null };
type Row = { id: string; other: Other };

/**
 * Renders a button that opens a dialog listing the current user's matches.
 * On selection, routes to the given mode for that match.
 *  - mode "collab"  -> /learn/collab/$matchId  (pair coding)
 *  - mode "live"    -> /learn/live/$matchId    (live chat + vocab/notes)
 */
export function PracticeWithMatch({
  mode,
  label = "Practice with a match",
}: {
  mode: "collab" | "live";
  label?: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data: m, error } = await supabase
          .from("matches")
          .select("id, user_a, user_b")
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
        if (error) throw error;
        const ids = (m ?? []).map((r) => (r.user_a === user.id ? r.user_b : r.user_a));
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
        const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));
        const merged: Row[] = (m ?? []).map((r) => {
          const otherId = r.user_a === user.id ? r.user_b : r.user_a;
          return {
            id: r.id,
            other: map.get(otherId) ?? { user_id: otherId, display_name: null, avatar_url: null },
          };
        });
        if (!cancelled) setRows(merged);
      } catch (e: any) {
        toast.error(e?.message ?? "Couldn't load matches");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  if (!user) {
    return (
      <Button asChild variant="outline" className="rounded-full">
        <Link to="/auth">
          <Users className="w-4 h-4 mr-1" /> {label}
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <Users className="w-4 h-4 mr-1" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle>Pick a match</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-8 text-center">
            <Heart className="w-10 h-10 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No matches yet.</p>
            <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <Link to="/discover">Find someone to swap with</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {rows.map((r) => {
              const initial = (r.other.display_name ?? "?").charAt(0).toUpperCase();
              return (
                <Link
                  key={r.id}
                  to={mode === "collab" ? "/learn/collab/$matchId" : "/learn/live/$matchId"}
                  params={{ matchId: r.id }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border hover:shadow-soft transition"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-hero overflow-hidden flex-shrink-0">
                    {r.other.avatar_url ? (
                      <img src={r.other.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-foreground font-display font-bold">
                        {initial}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{r.other.display_name ?? "Student"}</div>
                    <div className="text-xs text-muted-foreground">
                      {mode === "collab" ? "Open pair coding" : "Open live lesson"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
