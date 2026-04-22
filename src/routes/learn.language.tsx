import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { COURSES } from "@/data/languageLessons";
import { Languages } from "lucide-react";

export const Route = createFileRoute("/learn/language")({
  head: () => ({ meta: [{ title: "Languages · Swapr" }] }),
  component: LanguageHub,
});

function LanguageHub() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-mint flex items-center justify-center"><Languages className="w-5 h-5 text-secondary-foreground" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Languages</h1>
            <p className="text-sm text-muted-foreground">Pick a course and start a lesson.</p>
          </div>
        </div>

        <div className="space-y-6">
          {COURSES.map((c) => (
            <div key={c.id}>
              <h2 className="font-display font-bold text-lg mb-2">{c.flag} {c.name}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {c.lessons.map((l) => (
                  <Link
                    key={l.id}
                    to="/learn/language/$courseId/$lessonId"
                    params={{ courseId: c.id, lessonId: l.id }}
                    className="bg-card rounded-2xl p-4 border border-border hover:shadow-pop transition flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-mint flex items-center justify-center font-display font-bold text-secondary-foreground text-lg">{c.flag}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{l.title}</div>
                      <div className="text-xs text-muted-foreground">{l.questions.length} questions</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
