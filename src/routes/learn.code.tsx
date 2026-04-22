import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Code2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/learn/code")({
  head: () => ({ meta: [{ title: "Code Playground · Swapr" }] }),
  component: CodePage,
});

const LANGS: { id: string; label: string; version: string; sample: string }[] = [
  { id: "python", label: "Python", version: "3.10.0", sample: 'name = "Swapr"\nprint(f"Hello from {name}!")\nprint(sum(range(11)))' },
  { id: "javascript", label: "JavaScript", version: "18.15.0", sample: 'const x = [1,2,3,4,5];\nconsole.log("sum:", x.reduce((a,b)=>a+b));' },
  { id: "typescript", label: "TypeScript", version: "5.0.3", sample: 'const greet = (n: string): string => `Hi ${n}`;\nconsole.log(greet("Swapr"));' },
  { id: "java", label: "Java", version: "15.0.2", sample: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Swapr!");\n  }\n}' },
  { id: "c", label: "C", version: "10.2.0", sample: '#include <stdio.h>\nint main(){ printf("Hello, Swapr!\\n"); return 0; }' },
  { id: "cpp", label: "C++", version: "10.2.0", sample: '#include <iostream>\nint main(){ std::cout << "Hello, Swapr!\\n"; return 0; }' },
  { id: "go", label: "Go", version: "1.16.2", sample: 'package main\nimport "fmt"\nfunc main(){ fmt.Println("Hello, Swapr!") }' },
  { id: "rust", label: "Rust", version: "1.68.2", sample: 'fn main(){ println!("Hello, Swapr!"); }' },
  { id: "ruby", label: "Ruby", version: "3.0.1", sample: 'puts "Hello, Swapr!"\n3.times { |i| puts i }' },
  { id: "php", label: "PHP", version: "8.2.3", sample: '<?php\necho "Hello, Swapr!\\n";\nfor($i=0;$i<3;$i++) echo $i . "\\n";' },
];

function CodePage() {
  const [lang, setLang] = useState(LANGS[0]);
  const [code, setCode] = useState(LANGS[0].sample);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const onLangChange = (id: string) => {
    const next = LANGS.find((l) => l.id === id)!;
    setLang(next);
    setCode(next.sample);
    setOutput("");
  };

  const run = async () => {
    setRunning(true);
    setOutput("Running…");
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang.id, version: lang.version,
          files: [{ content: code }],
          stdin,
        }),
      });
      const data = await res.json();
      const out = (data.run?.stdout ?? "") + (data.run?.stderr ? `\n[stderr]\n${data.run.stderr}` : "");
      setOutput(out || "(no output)");
    } catch (e: any) {
      toast.error("Execution failed");
      setOutput(`Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl bg-gradient-cyber flex items-center justify-center"><Code2 className="w-5 h-5 text-primary-foreground" /></div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold flex-1">Code Playground</h1>
          <Select value={lang.id} onValueChange={onLangChange}>
            <SelectTrigger className="w-44 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>{LANGS.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={run} disabled={running} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            {running ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1" />} Run
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border bg-muted/40">Code · {lang.label}</div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-96 p-4 font-mono text-sm bg-transparent outline-none resize-none"
            />
          </div>
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border bg-muted/40">Input (stdin)</div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Optional standard input…"
                className="w-full h-24 p-4 font-mono text-sm bg-transparent outline-none resize-none"
              />
            </div>
            <div className="bg-foreground text-background rounded-2xl overflow-hidden">
              <div className="px-4 py-2 text-xs font-semibold border-b border-background/20">Output</div>
              <pre className="p-4 font-mono text-sm whitespace-pre-wrap min-h-56 max-h-72 overflow-auto">{output || "Hit Run to see output."}</pre>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">Powered by Piston · supports 20+ languages.</p>
      </div>
    </AppLayout>
  );
}
