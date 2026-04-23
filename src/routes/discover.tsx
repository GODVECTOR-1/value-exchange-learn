import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Loader2, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover · Swapr" }] }),
  component: DiscoverPage,
});

type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  skills_offered: string[];
  skills_wanted: string[];
};

function DiscoverPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: swiped } = await supabase.from("swipes").select("target_id").eq("swiper_id", user.id);
        const swipedIds = new Set((swiped ?? []).map((s) => s.target_id));
        swipedIds.add(user.id);
        const { data } = await supabase.from("profiles").select("*").limit(50);
        const filtered = (data ?? []).filter((p) => !swipedIds.has(p.user_id));
        setProfiles(filtered);
      } catch (err) {
        toast.error("Couldn't load profiles. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const current = profiles[index];

  const swipe = async (liked: boolean) => {
    if (!current) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (swiping) return;
    setSwiping(true);
    const target = current;
    setIndex(index + 1);
    try {
      const { error } = await supabase.from("swipes").insert({ swiper_id: user.id, target_id: target.user_id, liked });
      if (error) throw error;
      if (liked) {
        const { data: m } = await supabase
          .from("matches")
          .select("id")
          .or(`and(user_a.eq.${user.id},user_b.eq.${target.user_id}),and(user_a.eq.${target.user_id},user_b.eq.${user.id})`)
          .maybeSingle();
        if (m) toast.success("🎉 It's a match! Check your messages.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Swipe failed. Please try again.");
    } finally {
      setSwiping(false);
    }
  };

  if (authLoading || loading) {
    return <AppLayout><div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <h1 className="text-3xl font-display font-bold mb-1">Discover</h1>
        <p className="text-muted-foreground text-sm mb-6">Swipe right to swap skills.</p>

        {!current ? (
          <div className="bg-card rounded-3xl p-10 text-center border border-border">
            <Sparkles className="w-12 h-12 mx-auto text-primary mb-3" />
            <h2 className="font-display font-bold text-xl">You're all caught up!</h2>
            <p className="text-muted-foreground text-sm mt-2 mb-6">Check back later for new students. Or set up your profile to be discovered.</p>
            <Button asChild className="rounded-full"><Link to="/profile">Edit profile</Link></Button>
          </div>
        ) : (
          <div className="relative w-full h-[520px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={current.user_id}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ x: 300, opacity: 0, rotate: 15 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="absolute inset-0 bg-card rounded-3xl shadow-card border border-border overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-hero h-40 relative">
                  <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl bg-card border-4 border-card overflow-hidden shadow-pop">
                    {current.avatar_url ? (
                      <img src={current.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-2xl">
                        {(current.display_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-12 px-6 pb-6 flex-1 overflow-y-auto">
                  <h2 className="font-display font-bold text-2xl">{current.display_name ?? "Student"}</h2>
                  {current.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {current.location}
                    </div>
                  )}
                  {current.bio && <p className="text-sm mt-3 text-foreground/80">{current.bio}</p>}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Teaches</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {current.skills_offered.length === 0 && <span className="text-xs text-muted-foreground">Not set</span>}
                      {current.skills_offered.map((s) => (
                        <span key={s} className="bg-gradient-mint text-secondary-foreground px-2.5 py-1 rounded-full text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Wants to learn</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {current.skills_wanted.length === 0 && <span className="text-xs text-muted-foreground">Not set</span>}
                      {current.skills_wanted.map((s) => (
                        <span key={s} className="bg-gradient-sun text-foreground px-2.5 py-1 rounded-full text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {current && (
          <div className="relative z-10 flex justify-center gap-6 mt-6">
            <button
              type="button"
              onClick={() => swipe(false)}
              disabled={swiping}
              aria-label="Pass"
              className="relative z-10 w-16 h-16 rounded-full bg-card border-2 border-border shadow-pop flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-7 h-7 text-foreground/60" />
            </button>
            <button
              type="button"
              onClick={() => swipe(true)}
              disabled={swiping}
              aria-label="Like"
              className="relative z-10 w-16 h-16 rounded-full bg-gradient-hero shadow-pop flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {swiping ? <Loader2 className="w-6 h-6 animate-spin text-primary-foreground" /> : <Heart className="w-7 h-7 text-primary-foreground fill-current" />}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
