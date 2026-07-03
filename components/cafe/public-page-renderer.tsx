import type { CafeTheme, CafePageSection } from "@/lib/generated/prisma/client";

interface PublicPageRendererProps {
  theme: CafeTheme;
  sections: CafePageSection[];
}

export function PublicPageRenderer({ theme, sections }: PublicPageRendererProps) {
  const style: React.CSSProperties = {
    backgroundColor: theme.backgroundColor ?? "#ffffff",
    color: theme.textColor ?? "#111827",
    fontFamily: theme.fontFamily === "system" ? undefined : theme.fontFamily ?? undefined,
  };

  const visibleSections = sections.filter((s) => s.isVisible);

  return (
    <div style={style} className="min-h-screen">
      {theme.logoUrl && (
        <div className="flex justify-center py-6">
          <img src={theme.logoUrl} alt="Logo" className="h-16 object-contain" />
        </div>
      )}
      {theme.heroImageUrl && (
        <img src={theme.heroImageUrl} alt="Hero" className="w-full h-64 object-cover" />
      )}
      {visibleSections.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <p>No content published yet</p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-8 py-8 px-4">
          {visibleSections.map((section) => (
            <SectionBlock key={section.id} section={section} accentColor={theme.accentColor ?? "#f59e0b"} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionBlock({ section, accentColor }: { section: CafePageSection; accentColor: string }) {
  const content = section.content as Record<string, unknown> | null;
  const text = content?.text as string | undefined;
  const imageUrl = content?.imageUrl as string | undefined;
  const buttonLabel = content?.buttonLabel as string | undefined;
  const buttonUrl = content?.buttonUrl as string | undefined;

  return (
    <div className="rounded-lg border p-6" style={{ borderColor: accentColor }}>
      {section.title && <h2 className="text-2xl font-bold mb-3">{section.title}</h2>}
      {text && <p className="text-base leading-relaxed">{text}</p>}
      {imageUrl && (
        <img src={imageUrl} alt="" className="mt-4 h-48 w-full rounded-lg object-cover" />
      )}
      {buttonLabel && (
        <a
          href={buttonUrl || "#"}
          className="mt-4 inline-block rounded px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          {buttonLabel}
        </a>
      )}
    </div>
  );
}
