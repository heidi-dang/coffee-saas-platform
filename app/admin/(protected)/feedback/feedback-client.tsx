"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  order: {
    orderNumber: number;
    customerName: string | null;
    type: string;
    createdAt: string;
  };
}

interface FeedbackSummary {
  total: number;
  avgRating: number;
  distribution: { rating: number; count: number }[];
}

const PERIODS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

function StarRow({ filled }: { rating: number; filled: boolean }) {
  return (
    <Star
      className={`h-4 w-4 ${filled ? "fill-amber-500 text-amber-500" : "text-stone-200"}`}
    />
  );
}

export function FeedbackClient() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/feedback?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setFeedbacks(d.feedbacks || []);
        setSummary(d.summary || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900">Customer Feedback</h1>
          <p className="text-stone-500 text-sm mt-1">Star ratings and comments from your customers.</p>
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

      {loading || !summary ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex items-center gap-5">
              <div className="text-5xl font-black text-amber-800">
                {summary.avgRating.toFixed(1)}
              </div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarRow key={s} rating={s} filled={s <= Math.round(summary.avgRating)} />
                  ))}
                </div>
                <p className="text-xs text-stone-500">{summary.total} review{summary.total !== 1 ? "s" : ""}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-2">
              {summary.distribution.slice().reverse().map(({ rating, count }) => {
                const pct = summary.total > 0 ? (count / summary.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3 text-xs">
                    <span className="w-4 text-stone-500 font-bold text-right">{rating}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-stone-400 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {feedbacks.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200/50">
              <MessageSquare className="h-10 w-10 text-stone-300 mx-auto mb-4" />
              <h3 className="font-bold text-stone-800 mb-1">No feedback yet</h3>
              <p className="text-stone-500 text-xs">Reviews appear here once customers complete orders.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarRow key={s} rating={s} filled={s <= f.rating} />
                        ))}
                      </div>
                      {f.comment && (
                        <p className="text-stone-700 text-sm mt-2 leading-relaxed">{f.comment}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-stone-700">
                        #{f.order.orderNumber}
                        {f.order.customerName && ` · ${f.order.customerName}`}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5 capitalize">
                        {f.order.type.replace("_", " ").toLowerCase()}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        {new Date(f.createdAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
