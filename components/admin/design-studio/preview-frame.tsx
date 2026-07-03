"use client";

import { useState, useEffect } from "react";
import { getTheme, getSections } from "@/lib/api/admin-design-studio-client";

export function PreviewFrame() {
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

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading preview...</div>;

  const style: React.CSSProperties = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily === "system" ? undefined : theme.fontFamily,
  };

  return (
    <div style={style} className="min-h-[400px] rounded-lg border p-6">
      {theme.logoUrl && (
        <img src={theme.logoUrl} alt="Logo" className="mx-auto mb-4 h-16 object-contain" />
      )}
      {theme.heroImageUrl && (
        <img src={theme.heroImageUrl} alt="Hero" className="mb-6 w-full rounded-lg object-cover h-48" />
      )}
      {sections.length === 0 ? (
        <p className="text-center text-gray-400">No sections yet</p>
      ) : (
        <div className="space-y-6">
          {sections.filter((s) => s.isVisible).map((s) => (
            <div key={s.id} className="rounded-lg border p-4" style={{ borderColor: theme.accentColor }}>
              {s.title && <h3 className="text-lg font-bold" style={{ color: theme.primaryColor }}>{s.title}</h3>}
              {(s.content as any)?.text && <p className="mt-2">{s.content.text}</p>}
              {(s.content as any)?.imageUrl && (
                <img src={s.content.imageUrl} alt="" className="mt-2 h-32 w-full rounded object-cover" />
              )}
              {(s.content as any)?.buttonLabel && (
                <a
                  href={(s.content as any)?.buttonUrl || "#"}
                  className="mt-3 inline-block rounded px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  {s.content.buttonLabel}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
