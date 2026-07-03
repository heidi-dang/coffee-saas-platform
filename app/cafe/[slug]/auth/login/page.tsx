"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Coffee,
  LogIn,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CustomerLoginPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || `/cafe/${slug}/order`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/customer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect email or password. Please try again.");
        return;
      }

      if (!data.customer.isVerified) {
        router.push(`/cafe/${slug}/auth/verify-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/60 overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-800" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-stone-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Sign in to your account to order
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-10 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 leading-normal">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="customer-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-[0.98] text-white font-bold py-3 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-amber-900/10 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs text-stone-400 font-medium">or</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-stone-600">
            Don&apos;t have an account?{" "}
            <Link
              href={`/cafe/${slug}/auth/signup${redirectTo !== `/cafe/${slug}/order` ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className="font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Guest hint */}
      <p className="text-center text-xs text-stone-400 mt-4">
        Prefer to order as a guest?{" "}
        <Link
          href={redirectTo}
          className="text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors"
        >
          Continue without signing in
        </Link>
      </p>
    </div>
  );
}
