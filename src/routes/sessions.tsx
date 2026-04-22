import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Plus, Star, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sessions")({
  head: () => ({ meta: [{ title: "Sessions · Swapr" }] }),
  component: SessionsPage,
});

type Sess = {
  id: string; match_id: string; host_id: string; guest_id: string; topic: string;
  scheduled_at: string; duration_minutes: number; status: string;
  other_name?: string;
};

function SessionsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Sess[]>([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<{ id: string; other_id: string; other_name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [matchId, setMatchId] = useState("");
  const [topic, setTopic] = useState("");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState("30");
  const [reviewOpen, setReviewOpen] = useState<Sess | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => { if (!authLoading && !user) navigate({ to: "/auth" }); }, [authLoading, user, navigate]);

  const load = async () => {
    if (!user) return;
    const { data: ms } = await supabase.from("matches").select("*").or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
    const otherIds = (ms ?? []).map((r) => (r.user_a === user.id ? r.user_b : r.user_a));
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", otherIds.length ? otherIds : ["00000000-0000-0000-0000-000000000000"]);
    const pmap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name ?? "Student"]));
    setMatches((ms ?? []).map((r) => {
      const oid = r.user_a === user.id ? r.user_b : r.user_a;
      return { id: r.id, other_id: oid, other_name: pmap.get(oid) ?? "Student" };
    }));

    const { data: sess } = await supabase.from("sessions").select("*").or(`host_id.eq.${user.id},guest_id.eq.${user.id}`).order("scheduled_at", { ascending: true });
    setSessions((sess ?? []).map((s) => {
      const oid = s.host_id === user.id ? s.guest_id : s.host_id;
      return { ...s, other_name: pmap.get(oid) ?? "Student" };
    }));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!user || !matchId || !topic.trim() || !when) { toast.error("Fill in all fields"); return; }
    const m = matches.find((x) => x.id === matchId);
    if (!m) return;
    const { error } = await supabase.from("sessions").insert({
      match_id: matchId, host_id: user.id, guest_id: m.other_id,
      topic: topic.trim().slice(0, 200), scheduled_at: new Date(when).toISOString(),
      duration_minutes: Number(duration),
    });
    if (error) toast.error(error.message);
    else { toast.success("Session scheduled!"); setOpen(false); setTopic(""); setWhen(""); load(); }
  };

  const complete = async (s: Sess) => {
    const { error } = await supabase.from("sessions").update({ status: "completed" }).eq("id", s.id);
    if (error) toast.error(error.message);
    else { toast.success("Marked complete · +50 XP"); 
      // award XP
      const { data: prof } = await supabase.from("profiles").select("xp").eq("user_id", user!.id).maybeSingle();
      await supabase.from("profiles").update({ xp: (prof?.xp ?? 0) + 50 }).eq("user_id", user!.id);
      load();
    }
  };

  const submitReview = async () => {
    if (!user || !reviewOpen) return;
    const otherId = reviewOpen.host_id === user.id ? reviewOpen.guest_id : reviewOpen.host_id;
    const { error } = await supabase.from("reviews").insert({
      session_id: reviewOpen.id, reviewer_id: user.id, reviewee_id: otherId,
      rating, comment: comment.trim().slice(0, 1000) || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Review submitted!"); setReviewOpen(null); setComment(""); setRating(5); }
  };

  if (authLoading || loading) return <AppLayout><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Sessions</h1>
            <p className="text-muted-foreground text-sm">Schedule and review your skill swaps.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90"><Plus className="w-4 h-4 mr-1" /> New</Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle>Schedule a session</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>With</Label>
                  <Select value={matchId} onValueChange={setMatchId}>
                    <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Choose a match" /></SelectTrigger>
                    <SelectContent>
                      {matches.map((m) => <SelectItem key={m.id} value={m.id}>{m.other_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Topic</Label>
                  <Input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={200} className="rounded-xl mt-1" placeholder="e.g. Intro to React hooks" />
                </div>
                <div>
                  <Label>When</Label>
                  <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[15, 30, 45, 60, 90].map((n) => <SelectItem key={n} value={String(n)}>{n} minutes</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={create} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-card rounded-3xl p-10 text-center border border-border">
            <Calendar className="w-12 h-12 mx-auto text-primary mb-3" />
            <h2 className="font-display font-bold text-xl">No sessions yet</h2>
            <p className="text-muted-foreground text-sm mt-2">Schedule your first skill-swap session.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{s.topic}</div>
                  <div className="text-xs text-muted-foreground">With {s.other_name} · {new Date(s.scheduled_at).toLocaleString()} · {s.duration_minutes} min</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.status === "completed" ? "bg-success text-success-foreground" : s.status === "cancelled" ? "bg-muted text-muted-foreground" : "bg-gradient-sun text-foreground"}`}>{s.status}</span>
                {s.status === "scheduled" && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => complete(s)}><Check className="w-4 h-4 mr-1" /> Complete</Button>
                )}
                {s.status === "completed" && (
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setReviewOpen(s)}><Star className="w-4 h-4 mr-1" /> Review</Button>
                )}
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!reviewOpen} onOpenChange={(o) => !o && setReviewOpen(null)}>
          <DialogContent className="rounded-3xl">
            <DialogHeader><DialogTitle>Leave a review</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Rating</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)}><Star className={`w-7 h-7 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} /></button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Comment (optional)</Label>
                <Input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} className="rounded-xl mt-1" placeholder="How was the session?" />
              </div>
              <Button onClick={submitReview} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">Submit review</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
