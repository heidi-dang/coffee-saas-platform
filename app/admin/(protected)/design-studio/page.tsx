"use client";

import { useState } from "react";
import { ThemeEditor } from "@/components/admin/design-studio/theme-editor";
import { SectionList } from "@/components/admin/design-studio/section-list";
import { PreviewFrame } from "@/components/admin/design-studio/preview-frame";
import { publishDesign } from "@/lib/api/admin-design-studio-client";

type PublishState = { status: "idle" } | { status: "confirm" } | { status: "publishing" } | { status: "done"; slug?: string } | { status: "error"; message: string };

export default function DesignStudioPage() {
  const [tab, setTab] = useState<"theme" | "sections" | "preview">("sections");
  const [publish, setPublish] = useState<PublishState>({ status: "idle" });

  const handlePublish = async () => {
    if (publish.status === "publishing") return;
    setPublish({ status: "publishing" });
    try {
      const res = await publishDesign();
      setPublish({ status: "done", slug: (res as any)?.slug });
    } catch {
      setPublish({ status: "error", message: "Could not publish website. Please try again." });
    }
  };

  const resetPublish = () => setPublish({ status: "idle" });

  if (publish.status === "done") {
    return (
      <div className="mx-auto max-w-xl space-y-6 p-6 text-center">
        <div className="rounded-lg bg-green-50 border border-green-200 p-8">
          <h2 className="text-xl font-bold text-green-800">Website published successfully.</h2>
          <p className="mt-2 text-sm text-green-600">Customers can now see your changes.</p>
          <div className="mt-6 flex justify-center gap-3">
            {publish.slug && (
              <a
                href={`/cafe/${publish.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
              >
                View Public Site
              </a>
            )}
            <button
              onClick={resetPublish}
              className="rounded bg-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-300"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Design Studio</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Draft changes are not visible to customers until you publish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPublish({ status: "confirm" })}
            disabled={publish.status === "publishing"}
            className="rounded bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Publish Website
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">Draft mode</p>
        <p className="text-xs text-amber-600">Customers cannot see these changes yet.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex gap-4 border-b pb-2">
            {(["sections", "theme"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-sm font-medium pb-1 border-b-2 transition ${
                  tab === t ? "border-amber-600 text-amber-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "sections" ? "Sections" : "Theme"}
              </button>
            ))}
          </div>

          {publish.status === "confirm" && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Publish website changes?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Customers will see these changes immediately after publishing.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handlePublish}
                  className="rounded bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Publish Website
                </button>
                <button
                  onClick={resetPublish}
                  className="rounded bg-gray-200 px-5 py-2 text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {publish.status === "publishing" && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">Publishing website...</p>
            </div>
          )}

          {publish.status === "error" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{publish.message}</p>
              <button
                onClick={resetPublish}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {tab === "theme" && <ThemeEditor />}
          {tab === "sections" && <SectionList />}
        </div>

        <div className="w-full lg:w-[450px] shrink-0 sticky top-6 self-start">
          <div className="border rounded-2xl overflow-hidden shadow-xl bg-white flex flex-col h-[85vh]">
            <div className="bg-stone-100 border-b p-3 flex items-center justify-center text-xs font-bold text-stone-500 tracking-wider">
              Live Preview
            </div>
            <div className="flex-1 overflow-hidden relative">
              <PreviewFrame />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
