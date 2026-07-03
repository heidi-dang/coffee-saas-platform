"use client";

import { useState } from "react";
import { ThemeEditor } from "@/components/admin/design-studio/theme-editor";
import { SectionList } from "@/components/admin/design-studio/section-list";
import { PreviewFrame } from "@/components/admin/design-studio/preview-frame";
import { publishDesign } from "@/lib/api/admin-design-studio-client";
import { useRouter } from "next/navigation";

export default function DesignStudioPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"theme" | "sections" | "preview">("sections");
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!confirm("Publish all draft changes to the public page?")) return;
    setPublishing(true);
    try {
      await publishDesign();
      alert("Published successfully!");
    } catch {
      alert("Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Design Studio</h1>
        <div className="flex gap-2">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 -mt-4">
        Draft changes are not visible to customers until you publish.
      </p>

      <div className="flex gap-4 border-b pb-2">
        {(["sections", "theme", "preview"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-medium pb-1 border-b-2 transition ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "sections" ? "Sections" : t === "theme" ? "Theme" : "Preview"}
          </button>
        ))}
      </div>

      {tab === "theme" && <ThemeEditor />}
      {tab === "sections" && <SectionList />}
      {tab === "preview" && <div className="border rounded-lg p-4"><PreviewFrame /></div>}
    </div>
  );
}
