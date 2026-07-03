"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Download, Trash2 } from "lucide-react";

interface CafeTable {
  id: string;
  tableNumber: string;
  qrToken: string;
  isActive: boolean;
  createdAt: string;
}

function qrUrl(orderUrl: string, size = 200): string {
  return `/api/qr?data=${encodeURIComponent(orderUrl)}&size=${size}`;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNum, setNewTableNum] = useState("");
  const [cafeSlug, setCafeSlug] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  function orderUrlForTable(table: CafeTable): string {
    const origin = window?.location?.origin || "";
    return `${origin}/cafe/${cafeSlug || "demo-coffee"}/order?tableToken=${table.qrToken}`;
  }

  async function loadTables() {
    const res = await fetch("/api/admin/tables");
    const data = await res.json();
    setTables(data.tables || []);
    setCafeSlug(data.cafeSlug || "");
    setLoading(false);
  }

  useEffect(() => {
    loadTables();
  }, []);

  async function addTable() {
    if (!newTableNum.trim()) return;
    await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber: newTableNum }),
    });
    setNewTableNum("");
    loadTables();
  }

  async function toggleTable(tableId: string, isActive: boolean) {
    await fetch(`/api/admin/tables/${tableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    loadTables();
  }

  async function regenerateQr(tableId: string) {
    await fetch(`/api/admin/tables/${tableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateQr: true }),
    });
    loadTables();
  }

  async function deleteTable(tableId: string) {
    if (!confirm("Delete this table?")) return;
    await fetch(`/api/admin/tables/${tableId}`, { method: "DELETE" });
    loadTables();
  }

  function downloadQr(url: string, label: string) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = qrUrl(url, 300);
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `qr-${label.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
  }

  function printQr(url: string, label: string) {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>QR - ${label}</title></head>
        <body style="text-align:center;padding:20px;">
          <h2>${label}</h2>
          <img src="${qrUrl(url, 300)}" />
          <p>${url}</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tables & QR Codes</h1>

      <div className="flex gap-2 mb-6">
        <Input
          value={newTableNum}
          onChange={(e) => setNewTableNum(e.target.value)}
          placeholder="Table number"
          className="max-w-xs"
        />
        <Button size="sm" onClick={addTable}>
          <Plus className="h-4 w-4 mr-1" /> Add Table
        </Button>
      </div>

      <div ref={printRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => {
          const url = orderUrlForTable(table);
          return (
            <div
              key={table.id}
              className={`border rounded-lg p-4 ${
                !table.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Table {table.tableNumber}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    table.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {table.isActive ? "Active" : "Disabled"}
                </span>
              </div>

              <div className="w-full border rounded-lg p-2 mb-3">
                <img
                  src={qrUrl(url)}
                  alt={`QR for Table ${table.tableNumber}`}
                  className="w-full max-w-[200px] mx-auto"
                />
                <p className="text-xs text-muted-foreground text-center mt-1 truncate">{url}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    toggleTable(table.id, table.isActive)
                  }
                  className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80"
                >
                  {table.isActive ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => regenerateQr(table.id)}
                  className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80"
                >
                  <RefreshCw className="h-3 w-3 inline mr-1" />
                  New QR
                </button>
                <button
                  onClick={() =>
                    downloadQr(url, `Table-${table.tableNumber}`)
                  }
                  className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80"
                >
                  <Download className="h-3 w-3 inline mr-1" />
                  Download
                </button>
                <button
                  onClick={() =>
                    printQr(url, `Table ${table.tableNumber}`)
                  }
                  className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80"
                >
                  Print
                </button>
                <button
                  onClick={() => deleteTable(table.id)}
                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
