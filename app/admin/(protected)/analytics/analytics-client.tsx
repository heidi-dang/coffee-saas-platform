"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  BarChart2,
  Coffee,
} from "lucide-react";

interface AnalyticsData {
  summary: {
    totalRevenueCents: number;
    totalOrders: number;
    avgOrderValueCents: number;
  };
  ordersByType: Record<string, number>;
  topItems: { name: string; qty: number; revenueCents: number }[];
  dailyTrend: { date: string; revenueCents: number; orders: number }[];
  peakHours: { hour: number; orders: number }[];
  period: string;
}

const PERIODS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: any;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex items-start gap-4">
      <div className="p-3 bg-amber-50 rounded-xl shrink-0">
        <Icon className="h-5 w-5 text-amber-800" />
      </div>
      <div>
        <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-stone-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function HourBar({ hour, orders, maxOrders }: { hour: number; orders: number; maxOrders: number }) {
  const pct = maxOrders > 0 ? (orders / maxOrders) * 100 : 0;
  const label = hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`;
  return (
    <div className="flex flex-col items-center gap-1" title={`${label}: ${orders} orders`}>
      <div className="w-5 bg-stone-100 rounded-sm overflow-hidden flex flex-col-reverse" style={{ height: 64 }}>
        <div
          className="bg-amber-500 rounded-sm transition-all duration-500"
          style={{ height: `${pct}%` }}
        />
      </div>
      {hour % 4 === 0 && (
        <span className="text-[9px] text-stone-400 font-medium">{label}</span>
      )}
    </div>
  );
}

export function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const maxDailyRevenue = Math.max(1, ...(data?.dailyTrend.map((d) => d.revenueCents) || []));
  const maxHourOrders = Math.max(1, ...(data?.peakHours.map((h) => h.orders) || []));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Analytics</h1>
          <p className="text-stone-500 text-sm mt-1">Revenue, orders, and trends at a glance.</p>
        </div>
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                period === p.value
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
            <p className="text-stone-400 text-sm">Loading analytics…</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Revenue"
              value={formatCurrency(data.summary.totalRevenueCents)}
              icon={DollarSign}
              sub={`Last ${period === "7d" ? "7" : period === "30d" ? "30" : "90"} days`}
            />
            <StatCard
              label="Total Orders"
              value={data.summary.totalOrders.toString()}
              icon={ShoppingBag}
              sub="Excluding cancelled"
            />
            <StatCard
              label="Avg Order Value"
              value={formatCurrency(data.summary.avgOrderValueCents)}
              icon={TrendingUp}
              sub="Per completed order"
            />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="font-black text-stone-900 mb-5 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-amber-700" />
              Daily Revenue
            </h2>
            {data.dailyTrend.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-8">No data in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex items-end gap-2 min-w-max pb-2">
                  {data.dailyTrend.map((day) => {
                    const pct = maxDailyRevenue > 0 ? (day.revenueCents / maxDailyRevenue) * 100 : 0;
                    const label = new Date(day.date + "T00:00:00").toLocaleDateString("en-AU", {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <div key={day.date} className="flex flex-col items-center gap-1.5 group" title={`${label}: ${formatCurrency(day.revenueCents)}`}>
                        <div
                          className="w-10 bg-amber-100 rounded-t-lg overflow-hidden flex flex-col-reverse"
                          style={{ height: 120 }}
                        >
                          <div
                            className="bg-amber-600 group-hover:bg-amber-700 rounded-t-lg transition-all duration-300"
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-stone-400 font-medium">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="font-black text-stone-900 mb-5 flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-700" />
                Top Menu Items
              </h2>
              {data.topItems.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-8">No orders in this period.</p>
              ) : (
                <div className="space-y-3">
                  {data.topItems.map((item, idx) => {
                    const maxQty = data.topItems[0].qty;
                    const pct = maxQty > 0 ? (item.qty / maxQty) * 100 : 0;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs text-stone-400 font-bold w-4 shrink-0 text-right">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-bold text-stone-800 truncate">{item.name}</span>
                            <span className="text-xs text-stone-500 shrink-0 ml-2">{item.qty} sold</span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full">
                            <div
                              className="h-1.5 bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-500 shrink-0 w-16 text-right">
                          {formatCurrency(item.revenueCents)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="font-black text-stone-900 mb-5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-700" />
                Peak Hours
              </h2>
              <div className="flex items-end gap-0.5">
                {data.peakHours.map((h) => (
                  <HourBar
                    key={h.hour}
                    hour={h.hour}
                    orders={h.orders}
                    maxOrders={maxHourOrders}
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.peakHours
                  .filter((h) => h.orders > 0)
                  .sort((a, b) => b.orders - a.orders)
                  .slice(0, 3)
                  .map((h) => {
                    const label = h.hour === 0 ? "12am" : h.hour < 12 ? `${h.hour}am` : h.hour === 12 ? "12pm" : `${h.hour - 12}pm`;
                    return (
                      <span key={h.hour} className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full font-semibold">
                        {label} - {h.orders} orders
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="font-black text-stone-900 mb-5">Order Type Breakdown</h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(data.ordersByType).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-stone-800 capitalize">{type.replace("_", " ").toLowerCase()}</span>
                  <span className="text-xl font-black text-amber-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
