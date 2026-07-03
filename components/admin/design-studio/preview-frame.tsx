"use client";

import { useState, useEffect } from "react";
import { getTheme, getSections } from "@/lib/api/admin-design-studio-client";
import { useRouter } from "next/navigation";

export function PreviewFrame() {
  const router = useRouter();
  const [theme, setTheme] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTheme(), getSections()])
      .then(([t, s]: any) => {
        setTheme({
          primaryColor: t.primaryColor || "#111827",
          accentColor: t.accentColor || "#f59e0b",
          backgroundColor: t.backgroundColor || "#ffffff",
          textColor: t.textColor || "#111827",
          logoUrl: t.logoUrl || null,
          heroImageUrl: t.heroImageUrl || null,
          fontFamily: t.fontFamily || "system",
        });
        setSections(s as any[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-sm text-gray-500">Loading preview...</div>;

  const style: React.CSSProperties = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily === "system" ? undefined : theme.fontFamily,
  };

  const visibleSections = sections.filter((s: any) => s.draftIsVisible);

  return (
    <div>
      <div className="mb-4 rounded bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 text-center">
        Preview Mode — Customers cannot see these changes yet.
      </div>

      <div className="mb-4">
        <button
          onClick={() => router.push("/admin/design-studio")}
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Editor
        </button>
      </div>

      <div style={style} className="min-h-[400px] rounded-lg border p-6">
        {theme.logoUrl && (
          <img src={theme.logoUrl} alt="Logo" className="mx-auto mb-4 h-16 object-contain" />
        )}
        {theme.heroImageUrl && (
          <img src={theme.heroImageUrl} alt="Hero" className="mb-6 w-full rounded-lg object-cover h-48" />
        )}
        {visibleSections.length === 0 ? (
          <p className="text-center text-sm text-gray-400">No sections yet</p>
        ) : (
          <div className="space-y-6">
            {visibleSections.map((s: any) => (
              <div key={s.id} className="rounded-lg border p-4" style={{ borderColor: theme.accentColor }}>
                {s.draftTitle && <h3 className="text-lg font-bold" style={{ color: theme.primaryColor }}>{s.draftTitle}</h3>}
                {(s.draftContent as any)?.text && <p className="mt-2 text-sm">{(s.draftContent as any).text}</p>}
                {(s.draftContent as any)?.imageUrl && (
                  <img src={(s.draftContent as any).imageUrl} alt="" className="mt-2 h-32 w-full rounded object-cover" />
                )}
                {(s.draftContent as any)?.buttonLabel && (s.draftContent as any)?.buttonUrl && (
                  <a
                    href={(s.draftContent as any).buttonUrl}
                    className="mt-3 inline-block rounded px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    {(s.draftContent as any).buttonLabel}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
