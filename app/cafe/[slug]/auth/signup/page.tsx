"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Coffee,
  UserPlus,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CustomerSignupPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || `/cafe/${slug}/order`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create account. Please try again.");
        return;
      }

      // Redirect to verify-email page, passing the dev token if available
      const verifyParams = new URLSearchParams({
        email,
        redirect: redirectTo,
        ...(data.devVerifyToken ? { devToken: data.devVerifyToken } : {}),
      });
      router.push(`/cafe/${slug}/auth/verify-email?${verifyParams.toString()}`);
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = (() => {
    if (!password) return null;
    if (password.length < 8) return { level: 0, label: "Too short", color: "bg-red-400" };
    if (password.length < 10) return { level: 1, label: "Weak", color: "bg-orange-400" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 3, label: "Strong", color: "bg-green-500" };
    return { level: 2, label: "Fair", color: "bg-amber-400" };
  })();

  return (
    <div className="w-full max-w-md">
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
                Create your account
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Save your details for faster ordering
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5"
              >
                Your name <span className="font-normal text-stone-400 normal-case">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  id="signup-email"
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
                htmlFor="signup-password"
                className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all ${
                          i < passwordStrength.level
                            ? passwordStrength.color
                            : "bg-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Strength:{" "}
                    <span className="font-semibold text-stone-600">
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full rounded-xl border bg-stone-50 pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:ring-2 outline-none transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-200/40"
                      : "border-stone-200 focus:border-amber-500 focus:ring-amber-500/20"
                  }`}
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-red-500 mt-1">Passwords do not match.</p>
              )}
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
              id="customer-signup-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-[0.98] text-white font-bold py-3 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-amber-900/10 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create account
                </>
              )}
            </button>

            <p className="text-[10px] text-stone-400 text-center leading-relaxed">
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-xs text-stone-400 font-medium">or</span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link
              href={`/cafe/${slug}/auth/login${redirectTo !== `/cafe/${slug}/order` ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className="font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

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
