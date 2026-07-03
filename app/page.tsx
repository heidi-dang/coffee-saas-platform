import Link from "next/link";
import { Coffee, QrCode, Clock, Sparkles, Smartphone, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100 selection:bg-amber-500 selection:text-neutral-950 overflow-x-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-neutral-50 to-neutral-300 bg-clip-text text-transparent">
              Coffee<span className="text-amber-500">QR</span>
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/cafe/demo-coffee"
              className="text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Demo Cafe
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 px-4 text-sm font-medium text-neutral-200 hover:bg-neutral-800 hover:text-neutral-50 transition-colors"
            >
              Admin Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400 mb-6 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering modern café operations
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight bg-gradient-to-b from-neutral-50 to-neutral-300 bg-clip-text text-transparent">
            Beautiful QR Ordering <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Built for Your Café</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Let customers scan a table QR code, customise their winter drinks, and order in seconds. Keep your staff happy with real-time order tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/cafe/demo-coffee"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-amber-500 px-8 font-semibold text-neutral-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
              View Demo Cafe
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-8 font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-neutral-50 active:scale-95 transition-all"
            >
              Open Dashboard
            </Link>
          </div>

          {/* Interactive Mockup Container */}
          <div className="relative max-w-3xl mx-auto border border-neutral-800 bg-neutral-950/40 rounded-2xl p-2 backdrop-blur-sm shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="rounded-xl border border-neutral-900 overflow-hidden bg-neutral-900/50 aspect-video flex flex-col items-center justify-center p-6 text-left">
              <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-200">Demo Coffee</h4>
                    <p className="text-xs text-neutral-500">Table 4 — Dine in</p>
                  </div>
                  <div className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-amber-500">
                    <QrCode className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/30 border border-neutral-900">
                    <div>
                      <p className="text-xs font-semibold text-neutral-300">1x Flat White</p>
                      <p className="text-[10px] text-neutral-500">Oat milk, Extra shot</p>
                    </div>
                    <span className="text-xs font-medium text-neutral-300">$6.50</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/30 border border-neutral-900">
                    <div>
                      <p className="text-xs font-semibold text-neutral-300">1x Almond Croissant</p>
                      <p className="text-[10px] text-neutral-500">Warm</p>
                    </div>
                    <span className="text-xs font-medium text-neutral-300">$7.50</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-900 flex justify-between items-center text-xs font-bold text-neutral-300">
                  <span>Total</span>
                  <span className="text-amber-500">$14.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-neutral-900 bg-neutral-950/50 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-100 sm:text-4xl mb-4">
                Designed to run your café smoothly
              </h2>
              <p className="text-neutral-400 max-w-xl mx-auto">
                No complex tablet installs or training needed. Scan, order, prepare, complete.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: QrCode,
                  title: "Instant QR Menus",
                  desc: "Generate unique QR codes for every table. Let customers order without queuing up.",
                },
                {
                  icon: Clock,
                  title: "Live Order Pipeline",
                  desc: "Orders flow directly onto the kitchen screen. Update order status in a single tap.",
                },
                {
                  icon: Smartphone,
                  title: "Sleek Mobile App",
                  desc: "Fully optimized web application for a frictionless order-to-pay guest experience.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="group relative border border-neutral-900 bg-neutral-900/20 rounded-2xl p-8 hover:border-neutral-800 transition-all hover:bg-neutral-900/40"
                >
                  <div className="inline-flex p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-5 group-hover:scale-110 transition-transform">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-neutral-200">{f.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / CTA Section */}
        <section className="border-t border-neutral-900 py-20 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-neutral-50 to-neutral-300 bg-clip-text text-transparent">
              Ready to modernise your café?
            </h2>
            <p className="text-neutral-400 mb-10 max-w-md mx-auto">
              Get started with our standard plan designed for single or multi-tenant operations.
            </p>

            <div className="max-w-sm mx-auto border border-neutral-850 bg-neutral-900/40 backdrop-blur-sm rounded-2xl p-8 text-left relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-neutral-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Popular
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">Cafe Owner</h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-neutral-100">$49</span>
                <span className="text-neutral-500 text-sm">/month</span>
              </div>
              <p className="text-neutral-400 text-xs mb-6">Complete self-service QR ordering platform for your café.</p>
              
              <ul className="space-y-3.5 mb-8 text-sm text-neutral-300">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                  Unlimited menu items & categories
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                  Table QR code generator
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                  Real-time kitchen order board
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
                  Design Studio customization
                </li>
              </ul>

              <Link
                href="/admin/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-semibold text-sm transition-colors"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 text-center text-sm text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} CoffeeQR. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/admin/login" className="hover:text-neutral-300">Admin</Link>
            <Link href="/cafe/demo-coffee" className="hover:text-neutral-300">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
