"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

interface CustomerSession {
  id: string;
  email: string;
  name: string | null;
  isVerified: boolean;
}

interface CustomerAuthButtonProps {
  cafeSlug: string;
}

export function CustomerAuthButton({ cafeSlug }: CustomerAuthButtonProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerSession | null | undefined>(
    undefined // undefined = loading
  );
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/customer/auth/me")
      .then((r) => r.json())
      .then((d) => setCustomer(d.customer ?? null))
      .catch(() => setCustomer(null));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    setOpen(false);
    await fetch("/api/customer/auth/logout", { method: "POST" });
    setCustomer(null);
    setSigningOut(false);
    router.refresh();
  }

  // Loading state — skeleton
  if (customer === undefined) {
    return (
      <div className="h-8 w-20 rounded-xl bg-stone-200/70 animate-pulse" />
    );
  }

  // Not signed in
  if (!customer) {
    return (
      <Link
        href={`/cafe/${cafeSlug}/auth/login`}
        id="customer-signin-btn"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-400 text-xs font-semibold transition-all active:scale-95 shadow-sm"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </Link>
    );
  }

  // Signed in
  const initials =
    customer.name
      ? customer.name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : customer.email[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="customer-account-btn"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-all active:scale-95 shadow-sm"
      >
        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">
          {initials}
        </div>
        <span className="text-xs font-semibold text-stone-700 max-w-[80px] truncate">
          {customer.name || customer.email.split("@")[0]}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User info */}
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-xs font-bold text-stone-900 truncate">
              {customer.name || "My Account"}
            </p>
            <p className="text-[11px] text-stone-500 truncate">{customer.email}</p>

            {/* Verification badge */}
            <div className="mt-2 flex items-center gap-1.5">
              {customer.isVerified ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-medium text-green-600">
                    Email verified
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-medium text-amber-600">
                    Email not verified
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            {!customer.isVerified && (
              <Link
                href={`/cafe/${cafeSlug}/auth/verify-email?email=${encodeURIComponent(customer.email)}`}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Verify email
              </Link>
            )}

            <button
              id="customer-signout-btn"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors disabled:opacity-60"
            >
              {signingOut ? (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-stone-400/30 border-t-stone-600 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
