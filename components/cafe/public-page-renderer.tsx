import type { CafeTheme, CafePageSection } from "@/lib/generated/prisma/client";
import { getPublicTheme } from "@/lib/design-studio/helpers";

interface PublicPageRendererProps {
  theme: CafeTheme;
  sections: CafePageSection[];
}

export function PublicPageRenderer({ theme, sections }: PublicPageRendererProps) {
  const publicTheme = getPublicTheme(theme);

  if (!publicTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">No content published yet</p>
      </div>
    );
  }

  const style: React.CSSProperties = {
    backgroundColor: publicTheme.backgroundColor,
    color: publicTheme.textColor,
    fontFamily: publicTheme.fontFamily === "system" ? undefined : publicTheme.fontFamily,
  };

  const visibleSections = sections.filter(
    (s) => s.publishedIsVisible && s.publishedContent != null && s.publishedDeletedAt === null
  );

  return (
    <div style={style} className="min-h-screen">
      {publicTheme.logoUrl && (
        <div className="flex justify-center py-6">
          <img src={publicTheme.logoUrl} alt="Logo" className="h-16 object-contain" />
        </div>
      )}
      {publicTheme.heroImageUrl && (
        <img src={publicTheme.heroImageUrl} alt="Hero" className="w-full h-64 object-cover" />
      )}
      <div className="mx-auto max-w-4xl space-y-8 py-8 px-4">
        {visibleSections.map((section) => (
          <SectionBlock key={section.id} section={section} accentColor={publicTheme.accentColor} />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ section, accentColor }: { section: CafePageSection; accentColor: string }) {
  const content = section.publishedContent as Record<string, unknown> | null;
  const text = content?.text as string | undefined;
  const imageUrl = content?.imageUrl as string | undefined;
  const buttonLabel = content?.buttonLabel as string | undefined;
  const buttonUrl = content?.buttonUrl as string | undefined;

  return (
    <div className="rounded-lg border p-6" style={{ borderColor: accentColor }}>
      {section.publishedTitle && <h2 className="text-2xl font-bold mb-3">{section.publishedTitle}</h2>}
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
