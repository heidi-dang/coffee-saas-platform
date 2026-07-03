"use client";

import { useState, useEffect, useCallback } from "react";
import type { CafePageSection } from "@/lib/generated/prisma/client";
import { getSections, deleteSection, updateSection } from "@/lib/api/admin-design-studio-client";
import { SectionCard } from "./section-card";
import { SectionEditor } from "./section-editor";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

export function SectionList() {
  const [sections, setSections] = useState<CafePageSection[]>([]);
  const [editing, setEditing] = useState<CafePageSection | null | "new">(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await getSections();
      // Ensure sorted by sortOrder initially
      const sorted = (data as CafePageSection[]).sort((a, b) => a.sortOrder - b.sortOrder);
      setSections(sorted);
    } catch {
      setError("Could not load sections. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Background sync to db
        Promise.all(newItems.map((item, index) => 
          updateSection(item.id, { sortOrder: index })
        )).catch(console.error);
        
        return newItems;
      });
    }
  };

  const handleHide = async (id: string) => {
    if (!confirm("Hide this section from the draft? Customers will still see the published version until you publish.")) return;
    try {
      await deleteSection(id);
      load();
    } catch {
      setError("Could not hide section. Please try again.");
    }
  };

  if (loading) return <div className="p-4 text-sm text-gray-500">Loading sections...</div>;

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={load} className="mt-2 text-sm text-red-600 underline hover:text-red-800">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const publishedIds = new Set(
    sections.filter((s) => s.publishedAt !== null).map((s) => s.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sections</h3>
        <button
          onClick={() => setEditing("new")}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
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
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">No website sections yet.</p>
          <p className="mt-1 text-xs text-gray-400">Add a Hero section to start building your café website.</p>
          <button
            onClick={() => setEditing("new")}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Your First Section
          </button>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sections.map((s) => (
                <SectionCard
                  key={s.id}
                  section={s}
                  onEdit={(sec) => setEditing(sec)}
                  onDelete={handleHide}
                  isPublished={publishedIds.has(s.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
