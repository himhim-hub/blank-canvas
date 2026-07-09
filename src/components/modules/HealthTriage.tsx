import { useMemo, useState } from "react";
import { SYMPTOMS } from "@/lib/poultry-data";
import { triage } from "@/lib/poultry-calc";
import { Button } from "@/components/ui/button";
import { Camera, AlertTriangle, ShieldCheck, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export function HealthTriageModule() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [photo, setPhoto] = useState<string | null>(null);
  const result = useMemo(() => triage([...selected], !!photo), [selected, photo]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(f);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <div>
        <p className="text-sm text-muted-foreground">
          Tap what you're seeing in the flock. This gives you a <span className="font-medium text-foreground">category of concern</span> — not a diagnosis.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => {
            const on = selected.has(s.id);
            return (
              <button key={s.id} onClick={() => toggle(s.id)}
                className={cn("rounded-full border px-3.5 py-2 text-sm transition",
                  on ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}>
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-primary/50">
            <Camera className="h-4 w-4" />
            {photo ? "Change photo" : "Add photo (optional)"}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
          {photo && (
            <img src={photo} alt="Uploaded" className="h-14 w-14 rounded-md object-cover border border-border" />
          )}
          {selected.size > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setSelected(new Set()); setPhoto(null); }}>
              Reset
            </Button>
          )}
        </div>
      </div>

      <div>
        {result ? (
          <div className={cn("rounded-2xl border p-6",
            result.urgency === "high" ? "border-destructive/40 bg-destructive/5"
            : result.urgency === "medium" ? "border-clay/40 bg-clay/5"
            : "border-border bg-card")}>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              {result.urgency === "high" ? <AlertTriangle className="h-4 w-4 text-destructive" />
                : result.urgency === "medium" ? <Stethoscope className="h-4 w-4 text-clay" />
                : <ShieldCheck className="h-4 w-4 text-primary" />}
              {result.urgency} urgency
            </div>
            <p className="mt-3 font-display text-xl">{result.conditionName}</p>
            <p className="mt-2 text-sm text-muted-foreground">{result.note}</p>

            <div className="mt-4 rounded-lg bg-background/70 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium">{result.confidencePct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-border">
                <div className="h-full rounded-full bg-primary" style={{ width: `${result.confidencePct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                We deliberately cap confidence. Please confirm with a professional before treating.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Select at least one symptom to see a suggested next step.
          </div>
        )}
      </div>
    </div>
  );
}
