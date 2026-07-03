"use client";

import { useState, useEffect, useCallback } from "react";
import type { CafePageSection } from "@/lib/generated/prisma/client";
import { getSections, deleteSection } from "@/lib/api/admin-design-studio-client";
import { SectionCard } from "./section-card";
import { SectionEditor } from "./section-editor";

export function SectionList() {
  const [sections, setSections] = useState<CafePageSection[]>([]);
  const [editing, setEditing] = useState<CafePageSection | null | "new">(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getSections();
      setSections(data as CafePageSection[]);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleHide = async (id: string) => {
    if (!confirm("Hide this section?")) return;
    await deleteSection(id);
    load();
  };

  if (loading) return <div className="p-4 text-gray-500">Loading sections...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sections</h3>
        <button
          onClick={() => setEditing("new")}
          className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
        >
          + Add Section
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Draft changes are not visible to customers until you publish.
      </p>

      {editing === "new" && (
        <SectionEditor existing={null} onDone={() => { setEditing(null); load(); }} />
      )}
      {editing && editing !== "new" && (
        <SectionEditor existing={editing} onDone={() => { setEditing(null); load(); }} />
      )}

      {sections.length === 0 ? (
        <p className="text-sm text-gray-500">No sections yet. Add one to get started.</p>
      ) : (
        <div className="space-y-2">
          {sections.map((s) => (
            <SectionCard
              key={s.id}
              section={s}
              onEdit={(sec) => setEditing(sec)}
              onDelete={handleHide}
            />
          ))}
        </div>
      )}
    </div>
  );
}
