import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { COURSES } from "@/data/languageLessons";
import { Languages } from "lucide-react";
import { PracticeWithMatch } from "@/components/PracticeWithMatch";
import { SubjectHero } from "@/components/SubjectHero";
import { SubjectSettings } from "@/components/SubjectSettings";
import { useSubjectSettings } from "@/hooks/useSubjectSettings";

export const Route = createFileRoute("/learn/language")({
  head: () => ({ meta: [{ title: "Languages · Swapr" }] }),
  component: LanguageHub,
});

function LanguageHub() {
  const { settings, update } = useSubjectSettings("language");
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <SubjectHero
          icon={Languages}
          title="Languages"
          subtitle="Pick a course and start a lesson."
          gradient="bg-gradient-mint"
          tag={`${COURSES.length} courses`}
          actions={
            <>
              <PracticeWithMatch mode="live" label="Practice with a match" />
              <SubjectSettings subjectName="Languages" settings={settings} onChange={update} />
            </>
          }
        />

        <div className="space-y-8">
          {COURSES.map((c) => (
            <section key={c.id}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display font-bold text-xl flex items-center gap-2">
                  <span className="text-2xl">{c.flag}</span> {c.name}
                </h2>
                <span className="text-xs text-muted-foreground font-semibold">{c.lessons.length} lessons</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {c.lessons.map((l, idx) => (
                  <Link
                    key={l.id}
                    to="/learn/language/$courseId/$lessonId"
                    params={{ courseId: c.id, lessonId: l.id }}
                    className="group bg-card rounded-2xl p-4 border-2 border-border hover:border-primary/40 hover:shadow-pop hover:-translate-y-0.5 transition-all flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-mint flex items-center justify-center font-display font-bold text-white text-lg shrink-0 shadow-soft">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate group-hover:text-primary transition">{l.title}</div>
                      <div className="text-xs text-muted-foreground">{l.questions.length} questions · earn XP</div>
                    </div>
                    <span className="text-2xl">{c.flag}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
