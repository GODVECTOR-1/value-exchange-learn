import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { MatchCards } from "@/components/MatchCards";
import { Featured } from "@/components/Featured";
import { HowItWorks } from "@/components/HowItWorks";
import { Leaderboard } from "@/components/Leaderboard";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

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
