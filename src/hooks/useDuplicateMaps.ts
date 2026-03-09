import { useMemo } from "react";
import type { Sale } from "@/data/salesUtils";

/**
 * Pre-computes duplicate event_key lookup maps from allSales,
 * so AdminSaleCard can do O(1) lookups instead of O(n) filters per card.
 */
export function useDuplicateMaps(allSales: Sale[]) {
  return useMemo(() => {
    const published = new Map<string, number>();
    const drafts = new Map<string, number>();

    for (const s of allSales) {
      if (!s.event_key) continue;
      if (s.publish_status === "published") {
        published.set(s.event_key, (published.get(s.event_key) ?? 0) + 1);
      } else if (s.publish_status === "draft") {
        drafts.set(s.event_key, (drafts.get(s.event_key) ?? 0) + 1);
      }
    }

    // Subtract 1 from each count since the card itself shouldn't count
    // Actually we count all — the card will check its own key and the count includes itself
    // So for "same event_key published" we want count - (1 if self is published)
    // Since different cards have different statuses, we just return raw counts
    // and let the card handle the "minus self" logic implicitly (count >= 1 means at least one other)
    // Actually the old code filtered s.id !== sale.id, so we need exact counts.
    // Since we can't subtract per-card here, we return the total counts.
    // The card will see count >= 2 as "there are others" if it's the same status,
    // or count >= 1 if it's a different status.
    // For simplicity, return raw counts — the card subtracts 1 when its own status matches.

    return { duplicatePublished: published, duplicateDrafts: drafts };
  }, [allSales]);
}
