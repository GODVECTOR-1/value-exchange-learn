import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

export function CTA() {
  const { user } = useAuth();
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-hero p-10 sm:p-16 text-center shadow-card">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-background/20 animate-blob blur-2xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-background/20 animate-blob blur-2xl" style={{ animationDelay: "3s" }} />

          <div className="relative max-w-2xl mx-auto text-primary-foreground">
            <h2 className="font-display font-bold text-4xl sm:text-6xl tracking-tighter text-balance">
              Your next skill is one swap away.
            </h2>
            <p className="mt-4 text-lg opacity-90 text-balance">
              Join thousands of students learning by teaching. It's free, forever.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90 font-bold text-base h-12 px-7 gap-2 shadow-pop">
                <Link to={user ? "/profile" : "/auth"}>
                  {user ? "Go to my profile" : "Create free profile"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full text-primary-foreground hover:bg-background/15 font-semibold text-base h-12 px-7">
                <Link to="/learn">See how it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
