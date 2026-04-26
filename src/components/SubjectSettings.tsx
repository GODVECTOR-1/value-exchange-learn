import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import type { SubjectSettings as Settings, Difficulty } from "@/hooks/useSubjectSettings";

interface Props {
  subjectName: string;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  showDifficulty?: boolean;
  showTimer?: boolean;
}

const DIFFS: Difficulty[] = ["easy", "normal", "hard"];

export function SubjectSettings({ subjectName, settings, onChange, showDifficulty = true, showTimer = true }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative z-10 rounded-full bg-white/90 text-foreground border-0 hover:bg-white" aria-label={`${subjectName} settings`}>
          <Settings2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 rounded-2xl">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{subjectName} settings</div>
            <p className="text-xs text-muted-foreground mt-0.5">Saved on this device.</p>
          </div>

          {showDifficulty && (
            <div>
              <div className="text-sm font-semibold mb-2">Difficulty</div>
              <div className="flex gap-1 bg-muted rounded-full p-1">
                {DIFFS.map((d) => (
                  <button
                    key={d}
                    onClick={() => onChange({ difficulty: d })}
                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                      settings.difficulty === d ? "bg-background shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Sound effects</div>
              <p className="text-xs text-muted-foreground">Beeps on submit</p>
            </div>
            <Switch checked={settings.sound} onCheckedChange={(v) => onChange({ sound: v })} />
          </div>

          {showTimer && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Per-question timer</div>
                  <p className="text-xs text-muted-foreground">Auto-advance when 0</p>
                </div>
                <Switch checked={settings.timer} onCheckedChange={(v) => onChange({ timer: v })} />
              </div>
              {settings.timer && (
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Seconds</span><span className="font-semibold">{settings.timerSeconds}s</span></div>
                  <Slider value={[settings.timerSeconds]} min={10} max={120} step={5} onValueChange={(v) => onChange({ timerSeconds: v[0] })} />
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
