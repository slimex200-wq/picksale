export type Platform = "쿠팡" | "올리브영" | "무신사" | "KREAM" | "SSG" | "오늘의집" | "29CM";

export type SaleTier = "major" | "minor" | "excluded";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type PublishStatus = "draft" | "published" | "hidden";

export interface Sale {
  id: string;
  platform: Platform;
  sale_name: string;
  start_date: string;
  end_date: string;
  category: string[];
  link: string;
  description: string;
  sale_tier: SaleTier;
  importance_score: number;
  filter_reason: string;
  review_status: ReviewStatus;
  publish_status: PublishStatus;
  source_urls: string[];
  grouped_page_count: number;
  created_at?: string;
}

export const platforms: Platform[] = ["쿠팡", "올리브영", "무신사", "KREAM", "SSG", "오늘의집", "29CM"];

export const platformColors: Record<Platform, string> = {
  "쿠팡": "bg-sale-coupang",
  "올리브영": "bg-sale-oliveyoung",
  "무신사": "bg-sale-musinsa",
  "KREAM": "bg-sale-kream",
  "SSG": "bg-sale-ssg",
  "오늘의집": "bg-sale-ohouse",
  "29CM": "bg-sale-29cm",
};

export const platformEmojis: Record<Platform, string> = {
  "쿠팡": "🚀",
  "올리브영": "💚",
  "무신사": "🖤",
  "KREAM": "👟",
  "SSG": "🛒",
  "오늘의집": "🏠",
  "29CM": "✨",
};

const fmt = (d: Date) => d.toISOString().split("T")[0];

/* ── 세일 상태 ── */
export type SaleStatus = "live" | "starting_soon" | "ending_today" | "ended";

const platformWeight: Partial<Record<Platform, number>> = {
  "무신사": 1,
  "쿠팡": 1,
  "올리브영": 1,
};

export function getSaleStatus(sale: Sale): SaleStatus {
  const todayStr = fmt(new Date());
  if (sale.end_date < todayStr) return "ended";
  const endDiff = Math.ceil((new Date(sale.end_date).getTime() - Date.now()) / 86400000);
  if (sale.start_date <= todayStr && sale.end_date >= todayStr) {
    return endDiff <= 1 ? "ending_today" : "live";
  }
  return "starting_soon";
}

export const saleStatusConfig: Record<SaleStatus, { label: string; emoji: string; className: string }> = {
  live: { label: "진행중", emoji: "🟢", className: "bg-green-100 text-green-700 border-green-300" },
  starting_soon: { label: "곧 시작", emoji: "🟡", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  ending_today: { label: "오늘 종료", emoji: "🔴", className: "bg-red-100 text-red-700 border-red-300" },
  ended: { label: "종료", emoji: "⚪", className: "bg-muted text-muted-foreground" },
};

/* ── 랭킹 점수 계산 ── */
export function calculateRankingScore(sale: Sale): number {
  const now = new Date();
  const todayStr = fmt(now);
  let score = sale.importance_score;

  // 진행중 보너스
  if (sale.start_date <= todayStr && sale.end_date >= todayStr) score += 3;

  // 곧 시작 보너스 (3일 이내)
  const startDiff = Math.ceil((new Date(sale.start_date).getTime() - now.getTime()) / 86400000);
  if (startDiff > 0 && startDiff <= 3) score += 2;

  // 종료 임박 보너스 (2일 이내)
  const endDiff = Math.ceil((new Date(sale.end_date).getTime() - now.getTime()) / 86400000);
  if (endDiff >= 0 && endDiff <= 2) score += 2;

  // 플랫폼 가중치
  score += platformWeight[sale.platform] ?? 0;

  return score;
}

/* ── 랭킹순 정렬 ── */
export function sortByRanking(sales: Sale[]): Sale[] {
  return [...sales].sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
}

/* ── 기존 카테고리 분류 (하위 호환) ── */
export function categorizeSales(sales: Sale[]) {
  const now = new Date();
  const todayStr = fmt(now);

  const startsToday = sales.filter((s) => s.start_date === todayStr);
  const ongoing = sales.filter(
    (s) => s.start_date <= todayStr && s.end_date >= todayStr && s.start_date !== todayStr
  );
  const endingSoon = sales
    .filter((s) => {
      const end = new Date(s.end_date);
      const diff = (end.getTime() - now.getTime()) / 86400000;
      return diff >= 0 && diff <= 3 && s.start_date !== todayStr;
    })
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

  return { startsToday, ongoing, endingSoon };
}
