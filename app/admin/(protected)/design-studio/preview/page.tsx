"use client";

import { PreviewFrame } from "@/components/admin/design-studio/preview-frame";

export default function DesignStudioPreviewPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Page Preview</h1>
      <PreviewFrame />
    </div>
  );
}
