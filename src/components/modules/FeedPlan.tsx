import { useMemo, useState } from "react";
import { computeFeedPlan } from "@/lib/poultry-calc";
import type { BirdStage } from "@/lib/poultry-data";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FeedPlanModule({ defaultBirds }: { defaultBirds: number }) {
  const [birds, setBirds] = useState(defaultBirds);
  const [stage, setStage] = useState<BirdStage>("layer");
  const plan = useMemo(() => computeFeedPlan(stage, Math.max(1, birds)), [stage, birds]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Number of birds</Label>
          <Input type="number" min={1} value={birds} onChange={(e) => setBirds(+e.target.value || 1)} />
        </div>
        <div className="md:col-span-2">
          <Label>Growth stage</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["chick", "grower", "layer"] as BirdStage[]).map((s) => (
              <button key={s} type="button" onClick={() => setStage(s)}
                className={cn("rounded-lg border px-3 py-2 text-sm capitalize",
                  stage === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Daily feed" value={`${plan.dailyKg} kg`} />
        <Stat label="Daily cost" value={`KES ${plan.dailyCost.toLocaleString()}`} />
        <Stat label="Monthly cost" value={`KES ${plan.monthlyCost.toLocaleString()}`} accent />
        <Stat label="Protein" value={`${plan.proteinPct}%`} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-secondary/50 px-5 py-3 text-sm font-medium">
          Least-cost mix · KES {plan.costPerKg}/kg
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Ingredient</th>
              <th className="px-5 py-3 text-right font-medium">Share</th>
              <th className="px-5 py-3 text-right font-medium">kg / day</th>
              <th className="px-5 py-3 text-right font-medium">KES / day</th>
            </tr>
          </thead>
          <tbody>
            {plan.mix.map((row) => (
              <tr key={row.ingredient.id} className="border-t border-border">
                <td className="px-5 py-3">{row.ingredient.name}</td>
                <td className="px-5 py-3 text-right">{row.pct}%</td>
                <td className="px-5 py-3 text-right">{row.kg}</td>
                <td className="px-5 py-3 text-right">{row.cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Prices are indicative Kenyan agrovet rates and refresh as the platform's own pricing API adds partners.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4",
      accent ? "border-primary bg-primary/5" : "border-border bg-card")}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-2xl", accent && "text-primary")}>{value}</p>
    </div>
  );
}
