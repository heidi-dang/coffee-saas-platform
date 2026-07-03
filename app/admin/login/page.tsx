"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coffee, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect email or password. Please try again.");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong while connecting to the server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-neutral-950 text-neutral-100 selection:bg-amber-500 selection:text-neutral-950">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors bg-neutral-900/60 backdrop-blur border border-neutral-800 px-3.5 py-2 rounded-lg"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Site
      </Link>

      {/* Left side: Premium Ambient Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 overflow-hidden border-r border-neutral-850">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.08),transparent_50%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 m-auto max-w-md px-8 text-left">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-6">
            <Coffee className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-100 tracking-tight leading-tight mb-4">
            Simplifying café operations, one cup at a time.
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Manage your digital QR menu, track incoming table orders in real-time, and customize your brand appearance with our simple, guided Design Studio.
          </p>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/40 backdrop-blur-sm">
            <p className="text-xs text-neutral-400 italic">
              &quot;We replaced our physical print menus with CoffeeQR. Table wait times dropped by 25%, and our staff can focus entirely on craft brewing.&quot;
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-300">
                Lighthouse Roasters
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Coffee className="h-6 w-6 text-amber-500" />
            <span className="font-extrabold text-lg tracking-tight">
              Coffee<span className="text-amber-500">QR</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Welcome Back</h1>
            <p className="text-neutral-400 text-sm mt-1.5">
              Enter your credentials to access your café dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@cafe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-10 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-10 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 leading-normal">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 text-neutral-950 py-2.5 font-bold hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 transition-all flex items-center justify-center"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Quick Info Box for Dev Environment */}
          <div className="mt-8 p-3 rounded-lg border border-neutral-900 bg-neutral-900/20 text-center">
            <span className="text-[10px] text-neutral-500">
              Demo login: <span className="font-mono text-neutral-400">owner@democoffee.com</span> / <span className="font-mono text-neutral-400">password123</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
