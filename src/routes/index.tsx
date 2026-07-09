import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Ruler, Wheat, Stethoscope, MapPin } from "lucide-react";
import heroAsset from "@/assets/mixed-flock.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PoultryFit Kenya" },
      { name: "description", content: "Plan your flock the smart way. Built for Kenyan keepers." },
      { property: "og:title", content: "PoultryFit Kenya" },
      { property: "og:description", content: "Plan your flock the smart way." },
      { property: "og:image", content: heroAsset.url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard" });
  }, [ready, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-80 w-80 rounded-full bg-leaf/15 blur-3xl" />

        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-12 md:grid-cols-2 md:py-16">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
              Karibu. <span className="gold-underline">Raise a healthier flock.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Space, feed, health and a vet nearby. All in one app.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 md:max-w-md">
              <Tile icon={Ruler} label="Flock size" />
              <Tile icon={Wheat} label="Feed plan" />
              <Tile icon={Stethoscope} label="Health" />
              <Tile icon={MapPin} label="Find a vet" />
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl border-4 border-white shadow-[0_30px_60px_-20px_rgba(0,60,30,0.35)] ring-1 ring-gold/40">
              <img
                src={heroAsset.url}
                alt="Kenyan smallholder with her flock"
                width={1600}
                height={1104}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf/10 text-leaf">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
