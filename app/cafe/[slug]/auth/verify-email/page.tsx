"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { Mail, CheckCircle, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function VerifyEmailPage({ params }: PageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const redirectTo = searchParams.get("redirect") || `/cafe/${slug}/order`;
  // Dev-only: token surfaced from API so you can click-verify locally
  const devToken = searchParams.get("devToken");

  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [devVerifyToken, setDevVerifyToken] = useState<string | null>(devToken);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "";

  const devVerifyUrl = devVerifyToken
    ? `${appUrl}/api/customer/auth/verify?token=${devVerifyToken}&redirect=${encodeURIComponent(redirectTo)}`
    : null;

  async function handleResend() {
    setResendStatus("sending");
    try {
      const res = await fetch("/api/customer/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirect: redirectTo }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus("sent");
        if (data.devVerifyToken) setDevVerifyToken(data.devVerifyToken);
      } else {
        setResendStatus("error");
      }
    } catch {
      setResendStatus("error");
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/60 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-600 to-amber-800" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="inline-flex p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 mb-6">
            <Mail className="h-8 w-8" />
          </div>

          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight mb-2">
            Check your inbox
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed mb-1">
            We sent a verification link to
          </p>
          {email && (
            <p className="font-bold text-stone-800 text-sm mb-6 break-all">
              {email}
            </p>
          )}
          <p className="text-xs text-stone-400 leading-relaxed mb-8">
            Click the link in the email to verify your account and start ordering. The link expires in 24 hours.
          </p>

          {/* Dev-only verify shortcut */}
          {devVerifyUrl && (
            <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-left">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                Dev mode — click to verify
              </p>
              <a
                id="dev-verify-link"
                href={devVerifyUrl}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2 break-all transition-colors"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                Verify email now
              </a>
              <p className="text-[10px] text-amber-600 mt-2 leading-relaxed">
                In production, this link will be sent via email. Configure your SMTP/email provider in <code className="font-mono">.env</code>.
              </p>
            </div>
          )}

          {/* Resend */}
          <div className="space-y-3">
            {resendStatus === "sent" ? (
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-green-200 bg-green-50 text-xs text-green-700">
                <CheckCircle className="h-4 w-4" />
                New verification email sent!
              </div>
            ) : resendStatus === "error" ? (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">
                <AlertCircle className="h-4 w-4" />
                Something went wrong. Please try again.
              </div>
            ) : null}

            <button
              id="resend-verification-btn"
              onClick={handleResend}
              disabled={resendStatus === "sending" || resendStatus === "sent"}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold py-2.5 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resendStatus === "sending" ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-stone-400/30 border-t-stone-600 animate-spin" />
                  Resending…
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Resend verification email
                </>
              )}
            </button>

            <Link
              href={`/cafe/${slug}/auth/login`}
              className="block text-center text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
