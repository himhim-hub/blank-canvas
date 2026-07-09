import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signIn, getProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { toast } from "sonner";
import coopAsset from "@/assets/coop.jpg.asset.json";

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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-display text-2xl">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Back to your flock plan.</p>
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
            New here? <Link to="/signup" className="text-primary underline-offset-4 hover:underline">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
