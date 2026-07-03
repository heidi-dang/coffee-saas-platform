import type { CafeTheme, CafePageSection } from "@/lib/generated/prisma/client";
import { getPublicTheme } from "@/lib/design-studio/helpers";

interface PublicPageRendererProps {
  theme: CafeTheme;
  sections: CafePageSection[];
}

export function PublicPageRenderer({ theme, sections }: PublicPageRendererProps) {
  const publicTheme = getPublicTheme(theme);

  if (!publicTheme) {
    return null;
  }

  const visibleSections = sections.filter(
    (s) => s.publishedIsVisible && s.publishedContent != null && s.publishedDeletedAt === null
  );

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {visibleSections.map((section) => (
        <SectionBlock key={section.id} section={section} accentColor={publicTheme.accentColor} />
      ))}
    </div>
  );
}

function SectionBlock({ section, accentColor }: { section: CafePageSection; accentColor: string }) {
  const content = section.publishedContent as Record<string, unknown> | null;
  const text = content?.text as string | undefined;
  const imageUrl = content?.imageUrl as string | undefined;
  const buttonLabel = content?.buttonLabel as string | undefined;
  const buttonUrl = content?.buttonUrl as string | undefined;
  const hasButton = buttonLabel && buttonUrl;

  return (
    <div
      className="rounded-2xl border p-6 md:p-8 transition-all"
      style={{ borderColor: `${accentColor}20`, backgroundColor: `${accentColor}03` }}
    >
      {section.publishedTitle && (
        <h3 className="text-xl md:text-2xl font-black mb-4 tracking-tight">{section.publishedTitle}</h3>
      )}
      {text && <p className="text-sm md:text-base leading-relaxed opacity-90 whitespace-pre-wrap">{text}</p>}
      {imageUrl && (
        <img src={imageUrl} alt="" className="mt-6 h-56 md:h-72 w-full rounded-xl object-cover shadow-sm" />
      )}
      {hasButton && (
        <a
          href={buttonUrl}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 shadow-md active:scale-95"
          style={{ backgroundColor: accentColor }}
        >
          {buttonLabel}
        </a>
      )}
    </div>
  );
}
