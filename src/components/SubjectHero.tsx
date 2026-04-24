import { Link } from "@tanstack/react-router";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface SubjectHeroProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  gradient: string;
  tag?: string;
  actions?: ReactNode;
}

export function SubjectHero({ icon: Icon, title, subtitle, gradient, tag, actions }: SubjectHeroProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl ${gradient} p-5 sm:p-7 mb-6 shadow-card`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 w-44 h-44 rounded-full bg-black/10 blur-2xl" />
      <div className="relative">
        <Link to="/learn" className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-xs font-semibold mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> All subjects
        </Link>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7 text-white" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            {tag && (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5">
                {tag}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight">{title}</h1>
            <p className="text-white/85 text-sm sm:text-base mt-1">{subtitle}</p>
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap relative z-10">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
