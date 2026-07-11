import { useMemo } from "react";
import { computeFeasibility } from "@/lib/poultry-calc";
import { SPACE_PER_BIRD, STARTUP_COST_PER_BIRD } from "@/lib/poultry-data";
import type { FarmerProfile } from "@/lib/auth";
import { Ruler, Wallet, Scale, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeasibilityModule({ profile }: { profile: FarmerProfile }) {
  const result = useMemo(() => computeFeasibility(profile), [profile]);
  const perBird = SPACE_PER_BIRD[profile.housing];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended flock</p>
        <p className="mt-2 font-display text-6xl text-primary">{result.recommended}</p>
        <p className="mt-2 text-sm text-muted-foreground">birds you can comfortably keep</p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Limited by {result.bindingConstraint}
        </div>
      </div>

      <div className="grid gap-3 md:col-span-2">
        <Constraint
          icon={Ruler}
          label="By space"
          value={result.maxBySpace}
          hint={`${profile.lengthM && profile.widthM ? `${profile.lengthM}m × ${profile.widthM}m = ` : ""}${profile.spaceM2} m² ÷ ${perBird} m²/bird (${profile.housing.replace("-", " ")})`}
          binding={result.bindingConstraint === "space"}
        />
        <Constraint
          icon={Wallet}
          label="By budget"
          value={result.maxByBudget}
          hint={`KES ${profile.budgetKes.toLocaleString()} ÷ KES ${STARTUP_COST_PER_BIRD[profile.startingStage]}/bird (${stageLabel(profile.startingStage)})`}
          binding={result.bindingConstraint === "budget"}
        />
        {result.maxByBylaw !== null && (
          <Constraint
            icon={Scale}
            label={`By ${profile.county} bylaw`}
            value={result.maxByBylaw}
            hint="Advisory maximum for urban backyard keepers"
            binding={result.bindingConstraint === "bylaw"}
          />
        )}
      </div>

      {result.notes.length > 0 && (
        <div className="md:col-span-3 rounded-2xl border border-border bg-secondary/60 p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 text-clay" />
            <div className="space-y-2 text-sm">
              {result.notes.map((n, i) => <p key={i}>{n}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Constraint({
  icon: Icon, label, value, hint, binding,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; hint: string; binding: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border p-4",
      binding ? "border-primary bg-primary/5" : "border-border bg-card")}>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
        binding ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}

function stageLabel(s: FarmerProfile["startingStage"]) {
  return s === "chick" ? "day-old chicks" : s === "grower" ? "growers" : "point-of-lay";
}
