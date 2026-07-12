import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { toast } from "sonner";

const farmerImage = "/__l5e/assets-v1/5eb46824-d4f1-428a-b52f-b5f1a1b6bd23/farmer.jpg";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account · PoultryFit Kenya" }] }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      signUp(name, email, password);
      toast.success("Welcome! Let's set up your yard.");
      navigate({ to: "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background image + washes */}
      <div className="absolute inset-0 -z-10">
        <img src={farmerImage} alt="" aria-hidden className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.42_0.13_150/0.85),oklch(0.22_0.04_155/0.6)_55%,oklch(0.78_0.14_85/0.5))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.78_0.14_85/0.4),transparent_60%)]" />
      </div>

      <SiteHeader />

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center text-white drop-shadow">
            <h1 className="font-display text-4xl leading-tight">A planner made for your yard.</h1>
            <p className="mt-2 text-white/85">Takes a minute. No long forms.</p>
          </div>
          <form
            onSubmit={submit}
            className="rounded-3xl border border-white/40 bg-background/90 p-8 shadow-[0_30px_60px_-20px_rgba(0,40,20,0.5)] backdrop-blur-xl ring-1 ring-gold/30"
          >
            <h2 className="font-display text-2xl">Create your account</h2>
            <p className="mt-1 text-sm text-muted-foreground">Free while in pilot.</p>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} autoComplete="new-password" />
              </div>
            </div>

            <Button type="submit" className="mt-6 w-full" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already a member?{" "}
              <Link to="/signin" className="text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
