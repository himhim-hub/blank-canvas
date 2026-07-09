import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto grid max-w-5xl gap-10 px-6 py-14 md:grid-cols-2">
        <div className="hidden md:block">
          <h1 className="font-display text-4xl leading-tight">A planner made for your yard.</h1>
          <p className="mt-4 text-muted-foreground">
            Create an account to save your plan. We only ask what we need to size your flock —
            no long forms, no fluff.
          </p>
        </div>
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-8 shadow-sm">
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
            Already a member? <Link to="/signin" className="text-primary underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
