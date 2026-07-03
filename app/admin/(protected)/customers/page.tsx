"use client";

import { useEffect, useState } from "react";
import { Coffee, Search, Plus, Minus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoyaltyProfile {
  id: string;
  phone: string;
  name: string | null;
  stampsCount: number;
  updatedAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<LoyaltyProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function handleUpdateStamps(profileId: string, amount: number) {
    setUpdatingId(profileId);
    try {
      const res = await fetch(`/api/admin/customers/${profileId}/stamps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        await fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Loyalty Directory</h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage your customer stamps and loyalty profiles.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-md bg-white rounded-xl border border-stone-200 px-3 py-1">
        <Search className="h-4 w-4 text-stone-400" />
        <Input
          type="search"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 py-1 h-8 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-stone-400 text-sm">Loading profiles...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200/50">
          <UserCheck className="h-10 w-10 text-stone-300 mx-auto mb-4" />
          <h3 className="font-bold text-stone-850 mb-1">No profiles found</h3>
          <p className="text-stone-500 text-xs">When customers order with their phone number, they&apos;ll appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase border-b border-stone-200">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Stamps</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150 text-sm text-stone-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-stone-900">
                      {c.name || <span className="text-stone-400 font-normal italic">Unnamed Guest</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-stone-600">{c.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                          <Coffee className="h-4 w-4" />
                        </div>
                        <span className="font-black text-amber-900 text-base">{c.stampsCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStamps(c.id, -1)}
                          disabled={updatingId === c.id || c.stampsCount <= 0}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-stone-100"
                          title="Redeem/Subtract 1 stamp"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStamps(c.id, 1)}
                          disabled={updatingId === c.id}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-stone-100"
                          title="Add 1 stamp"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
