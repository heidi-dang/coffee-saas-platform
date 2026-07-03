"use client";

import { useState } from "react";
import { PreviewFrame } from "@/components/admin/design-studio/preview-frame";
import { publishDesign } from "@/lib/api/admin-design-studio-client";
import { useRouter } from "next/navigation";

export default function DesignStudioPreviewPage() {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);
  const [slug, setSlug] = useState<string | undefined>();
  const [error, setError] = useState("");

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    try {
      const res = await publishDesign();
      setDone(true);
      setSlug((res as any)?.slug);
    } catch {
      setError("Could not publish website. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl space-y-6 p-6 text-center">
        <div className="rounded-lg bg-green-50 border border-green-200 p-8">
          <h2 className="text-xl font-bold text-green-800">Website published successfully.</h2>
          <p className="mt-2 text-sm text-green-600">Customers can now see your changes.</p>
          <div className="mt-6 flex justify-center gap-3">
            {slug && (
              <a
                href={`/cafe/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
              >
                View Public Site
              </a>
            )}
            <button
              onClick={() => router.push("/admin/design-studio")}
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
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page Preview</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/admin/design-studio")}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Editor
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? "Publishing..." : "Publish Website"}
          </button>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <PreviewFrame />
    </div>
  );
}
