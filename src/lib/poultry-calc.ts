import {
  SPACE_PER_BIRD, STARTUP_COST_PER_BIRD, COUNTY_BYLAWS,
  FEED_INGREDIENTS, STAGE_TARGET, SYMPTOMS, CONDITIONS,
  type BirdStage, type FeedIngredient,
} from "./poultry-data";
import type { FarmerProfile } from "./auth";

// --- Feasibility -----------------------------------------------------------

export interface FeasibilityResult {
  maxBySpace: number;
  maxByBudget: number;
  maxByBylaw: number | null;
  recommended: number;
  bindingConstraint: "space" | "budget" | "bylaw";
  notes: string[];
}

export function computeFeasibility(p: FarmerProfile): FeasibilityResult {
  const perBird = SPACE_PER_BIRD[p.housing] ?? 0.5;
  const maxBySpace = Math.max(0, Math.floor(p.spaceM2 / perBird));
  const maxByBudget = Math.max(0, Math.floor(p.budgetKes / STARTUP_COST_PER_BIRD));
  const bylaw = COUNTY_BYLAWS[p.county];
  const maxByBylaw = bylaw ? bylaw.urbanMaxBackyard : null;

  const candidates: { value: number; key: FeasibilityResult["bindingConstraint"] }[] = [
    { value: maxBySpace, key: "space" },
    { value: maxByBudget, key: "budget" },
  ];
  if (maxByBylaw !== null) candidates.push({ value: maxByBylaw, key: "bylaw" });

  const min = candidates.reduce((a, b) => (a.value <= b.value ? a : b));
  const notes: string[] = [];
  if (bylaw?.requiresPermit) notes.push(`${p.county} County typically requires a livestock permit — check with your ward office.`);
  if (bylaw) notes.push(`Keep the coop at least ${bylaw.setbackMeters}m from the nearest neighbour to avoid disputes.`);
  if (bylaw?.note) notes.push(bylaw.note);

  return {
    maxBySpace,
    maxByBudget,
    maxByBylaw,
    recommended: min.value,
    bindingConstraint: min.key,
    notes,
  };
}

// --- Feed plan -------------------------------------------------------------

export interface FeedPlan {
  stage: BirdStage;
  birds: number;
  mix: { ingredient: FeedIngredient; kg: number; pct: number; cost: number }[];
  proteinPct: number;
  costPerKg: number;
  dailyKg: number;
  dailyCost: number;
  monthlyCost: number;
}

/**
 * Very simple least-cost heuristic: cheapest feasible 2- or 3-ingredient mix
 * that hits the stage's target protein. Not a full linear program, but honest
 * for an early-decision planner. Real API can swap in a proper LP later.
 */
export function computeFeedPlan(stage: BirdStage, birds: number): FeedPlan {
  const target = STAGE_TARGET[stage];
  // Build candidate two-ingredient mixes across (energy source, protein source, filler).
  const energySources = FEED_INGREDIENTS.filter((i) => i.energyKcal >= 2500 && i.proteinPct < 20);
  const proteinSources = FEED_INGREDIENTS.filter((i) => i.proteinPct >= 30);
  const lime = FEED_INGREDIENTS.find((i) => i.id === "lime")!;

  let best: FeedPlan | null = null;

  for (const e of energySources) {
    for (const pr of proteinSources) {
      // Solve x*e.protein + (1-x-limePct)*pr.protein = target.protein, limePct=5%
      const limePct = stage === "layer" ? 0.06 : 0.02;
      // let x = share of energy source, y = 1 - x - limePct = share of protein source
      // e.protein * x + pr.protein * (1 - x - limePct) = target
      const P = target.protein;
      const denom = pr.proteinPct - e.proteinPct;
      if (denom === 0) continue;
      const x = (pr.proteinPct * (1 - limePct) - P) / denom;
      const y = 1 - x - limePct;
      if (x < 0.05 || y < 0.05 || x > 0.95 || y > 0.95) continue;

      const costPerKg = x * e.pricePerKg + y * pr.pricePerKg + limePct * lime.pricePerKg;
      const proteinPct = x * e.proteinPct + y * pr.proteinPct;

      const dailyKg = (birds * target.gramsPerBirdDay) / 1000;
      const dailyCost = dailyKg * costPerKg;

      const mix = [
        { ingredient: e,   kg: +(x * dailyKg).toFixed(2),        pct: +(x * 100).toFixed(1),        cost: +(x * dailyKg * e.pricePerKg).toFixed(0) },
        { ingredient: pr,  kg: +(y * dailyKg).toFixed(2),        pct: +(y * 100).toFixed(1),        cost: +(y * dailyKg * pr.pricePerKg).toFixed(0) },
        { ingredient: lime,kg: +(limePct * dailyKg).toFixed(2),  pct: +(limePct * 100).toFixed(1),  cost: +(limePct * dailyKg * lime.pricePerKg).toFixed(0) },
      ];

      const candidate: FeedPlan = {
        stage, birds, mix,
        proteinPct: +proteinPct.toFixed(1),
        costPerKg: +costPerKg.toFixed(2),
        dailyKg: +dailyKg.toFixed(2),
        dailyCost: Math.round(dailyCost),
        monthlyCost: Math.round(dailyCost * 30),
      };
      if (!best || candidate.costPerKg < best.costPerKg) best = candidate;
    }
  }
  // Fallback if nothing found (shouldn't happen with current dataset)
  return best!;
}

// --- Triage ----------------------------------------------------------------

export interface TriageResult {
  topConditionId: string;
  conditionName: string;
  urgency: "low" | "medium" | "high";
  confidencePct: number;
  note: string;
  ranked: { id: string; name: string; score: number }[];
}

export function triage(selectedSymptomIds: string[], hasPhoto: boolean): TriageResult | null {
  if (selectedSymptomIds.length === 0) return null;
  const scores: Record<string, number> = {};
  for (const sid of selectedSymptomIds) {
    const rule = SYMPTOMS.find((s) => s.id === sid);
    if (!rule) continue;
    for (const [cond, w] of Object.entries(rule.weights)) {
      scores[cond] = (scores[cond] ?? 0) + (w ?? 0);
    }
  }
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const ranked = Object.entries(scores)
    .map(([id, score]) => ({ id, name: CONDITIONS[id].name, score }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  // Honest confidence: cap at 75% without a photo, 85% with one, scale by dominance.
  const dominance = top.score / total;
  const cap = hasPhoto ? 0.85 : 0.75;
  const confidencePct = Math.round(Math.min(cap, 0.35 + dominance * 0.5) * 100);

  const cond = CONDITIONS[top.id];
  return {
    topConditionId: top.id,
    conditionName: cond.name,
    urgency: cond.urgency,
    confidencePct,
    note: cond.note,
    ranked,
  };
}

// --- Distance --------------------------------------------------------------

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
