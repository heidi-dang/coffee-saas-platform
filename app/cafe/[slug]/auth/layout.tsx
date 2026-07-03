import { Coffee } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/cafe/${slug}/order`}
            className="flex items-center gap-2 group"
          >
            <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 group-hover:bg-amber-100 transition-colors">
              <Coffee className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900 transition-colors">
              ← Back to menu
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        {children}
      </main>

      <footer className="py-4 text-center">
        <p className="text-[11px] text-stone-400">
          Powered by{" "}
          <span className="font-bold text-stone-500">
            Coffee<span className="text-amber-600">QR</span>
          </span>
        </p>
      </footer>
    </div>
  );
}
