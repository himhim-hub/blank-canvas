import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signIn, getProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { toast } from "sonner";

const coopImage = "/__l5e/assets-v1/00511387-e354-4cbf-bd58-196c478af958/coop.jpg";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign in · PoultryFit Kenya" }] }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      signIn(email, password);
      toast.success("Welcome back.");
      navigate({ to: getProfile() ? "/dashboard" : "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10">
        <img src={coopImage} alt="" aria-hidden className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.30_0.09_155/0.92),oklch(0.18_0.04_155/0.85)_60%,oklch(0.42_0.13_150/0.75))]" />
      </div>

      <SiteHeader />

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-6 py-12">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-3xl border border-gold/30 bg-background/95 p-8 shadow-[0_30px_60px_-20px_rgba(0,40,20,0.5)] backdrop-blur-xl"
        >
          <h1 className="font-display text-3xl">Karibu tena.</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to pick up your flock plan.</p>

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
