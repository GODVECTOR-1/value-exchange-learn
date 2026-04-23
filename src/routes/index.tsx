import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { MatchCards } from "@/components/MatchCards";
import { Featured } from "@/components/Featured";
import { HowItWorks } from "@/components/HowItWorks";
import { Leaderboard } from "@/components/Leaderboard";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Swapr — Trade skills, not money" },
      { name: "description", content: "A Gen-Z skill-swap marketplace. Teach what you love, learn anything in return. Match, chat, and grow with students worldwide." },
      { property: "og:title", content: "Swapr — Trade skills, not money" },
      { property: "og:description", content: "Match with students who teach what you wanna learn — and learn from you in return." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, skills_offered")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled) return;
        const complete = !!data?.display_name && (data.skills_offered?.length ?? 0) > 0;
        if (complete) navigate({ to: "/matches" });
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <MatchCards />
        <Featured />
        <HowItWorks />
        <Leaderboard />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
