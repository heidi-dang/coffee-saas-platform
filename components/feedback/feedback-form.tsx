"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackFormProps {
  orderId: string;
  cafeSlug: string;
}

export function FeedbackForm({ orderId, cafeSlug }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, comment: comment || undefined }),
      });

      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit feedback.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2 mt-6">
        <div className="flex justify-center gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-5 w-5 ${s <= rating ? "fill-amber-500 text-amber-500" : "text-stone-300"}`}
            />
          ))}
        </div>
        <p className="font-bold text-amber-900 text-base">Thanks for your feedback!</p>
        <p className="text-amber-700 text-sm">Your review helps us improve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 border border-stone-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
      <div>
        <h2 className="font-black text-stone-900 text-base">How was your experience?</h2>
        <p className="text-stone-500 text-xs mt-0.5">Rate your order — it only takes 5 seconds.</p>
      </div>

      <div
        className="flex justify-center gap-2"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHovered(s)}
            className="focus:outline-none active:scale-90 transition-transform"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-9 w-9 transition-colors ${
                s <= (hovered || rating)
                  ? "fill-amber-500 text-amber-500"
                  : "text-stone-200"
              }`}
            />
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div className="space-y-2">
          <Textarea
            placeholder={
              rating >= 4
                ? "What did you love? (optional)"
                : "What could we do better? (optional)"
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="rounded-xl border border-stone-200 text-sm"
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full rounded-xl bg-amber-800 hover:bg-amber-950 text-white font-bold py-5 disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit Feedback"}
      </Button>
    </form>
  );
}
