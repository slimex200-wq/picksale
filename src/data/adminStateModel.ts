// Canonical Admin State Model
// Uses loose string types to work with raw DB query results

/* ── Canonical Primary States ── */
export type SalePrimaryState = "review_pending" | "approved_draft" | "published" | "hidden" | "rejected";

export function getSalePrimaryState(sale: { review_status: string; publish_status: string }): SalePrimaryState {
  if (sale.review_status === "rejected") return "rejected";
  if (sale.publish_status === "published") return "published";
  if (sale.publish_status === "hidden") return "hidden";
  if (sale.review_status === "approved" && sale.publish_status === "draft") return "approved_draft";
  return "review_pending";
}

export const primaryStateConfig: Record<SalePrimaryState, { label: string; emoji: string; className: string }> = {
  review_pending: { label: "검토 대기", emoji: "🟡", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  approved_draft: { label: "승인(초안)", emoji: "✅", className: "bg-green-100 text-green-700 border-green-300" },
  published: { label: "게시됨", emoji: "🟢", className: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  hidden: { label: "숨김", emoji: "👁️‍🗨️", className: "bg-muted text-muted-foreground border-border" },
  rejected: { label: "반려", emoji: "🔴", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

/* ── Source Classification ── */
export type SourceClass = "official" | "news" | "community" | "unknown";

export function getSourceClass(sale: Pick<Sale, "source_type">): SourceClass {
  const st = sale.source_type ?? "";
  if (st === "crawler" || st === "official") return "official";
  if (st === "news") return "news";
  if (st === "community") return "community";
  return "unknown";
}

export const sourceClassConfig: Record<SourceClass, { label: string; emoji: string; className: string }> = {
  official: { label: "공식", emoji: "🏢", className: "bg-blue-100 text-blue-700 border-blue-300" },
  news: { label: "뉴스", emoji: "📰", className: "bg-amber-100 text-amber-700 border-amber-300" },
  community: { label: "커뮤니티", emoji: "💬", className: "bg-purple-100 text-purple-700 border-purple-300" },
  unknown: { label: "기타", emoji: "❓", className: "bg-muted text-muted-foreground border-border" },
};

/* ── Upsert/Ingestion State ── */
export type UpsertState = "new" | "updated" | "duplicate";

export function getUpsertState(sale: Pick<Sale, "matched_by">): UpsertState {
  if (!sale.matched_by || sale.matched_by === "" || sale.matched_by === "none") return "new";
  return "updated";
}

export const upsertStateConfig: Record<UpsertState, { label: string; className: string }> = {
  new: { label: "신규", className: "bg-green-100 text-green-700 border-green-300" },
  updated: { label: "업데이트", className: "bg-blue-100 text-blue-700 border-blue-300" },
  duplicate: { label: "중복 차단", className: "bg-red-100 text-red-700 border-red-300" },
};

/* ── Count sales by primary state ── */
export function countByPrimaryState(sales: Pick<Sale, "review_status" | "publish_status">[]) {
  const counts: Record<SalePrimaryState, number> = {
    review_pending: 0, approved_draft: 0, published: 0, hidden: 0, rejected: 0,
  };
  for (const s of sales) {
    counts[getSalePrimaryState(s)]++;
  }
  return counts;
}

/* ── Count sales by source class ── */
export function countBySourceClass(sales: Pick<Sale, "source_type">[]) {
  const counts: Record<SourceClass, number> = { official: 0, news: 0, community: 0, unknown: 0 };
  for (const s of sales) {
    counts[getSourceClass(s)]++;
  }
  return counts;
}
