export type Platform = "쿠팡" | "올리브영" | "무신사" | "KREAM" | "SSG" | "오늘의집" | "29CM" | "WCONCEPT" | "커뮤니티 핫딜";

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
  image_url?: string;
  event_id?: string | null;
  signal_id?: string | null;
  created_at?: string;
}

export const platforms: Platform[] = ["쿠팡", "올리브영", "무신사", "KREAM", "SSG", "오늘의집", "29CM", "WCONCEPT", "커뮤니티 핫딜"];

export const platformSlugs: Record<Platform, string> = {
  "쿠팡": "coupang",
  "올리브영": "oliveyoung",
  "무신사": "musinsa",
  "KREAM": "kream",
  "SSG": "ssg",
  "오늘의집": "ohouse",
  "29CM": "29cm",
  "WCONCEPT": "wconcept",
  "커뮤니티 핫딜": "community",
};

export const slugToPlatform: Record<string, Platform> = Object.fromEntries(
  Object.entries(platformSlugs).map(([k, v]) => [v, k as Platform])
) as Record<string, Platform>;

export const platformLogoImports: Record<Platform, string> = {
  "쿠팡": "coupang",
  "올리브영": "oliveyoung",
  "무신사": "musinsa",
  "KREAM": "kream",
  "SSG": "ssg",
  "오늘의집": "ohouse",
  "29CM": "29cm",
  "WCONCEPT": "wconcept",
  "커뮤니티 핫딜": "community",
};

export const platformColors: Record<Platform, string> = {
  "쿠팡": "bg-sale-coupang",
  "올리브영": "bg-sale-oliveyoung",
  "무신사": "bg-sale-musinsa",
  "KREAM": "bg-sale-kream",
  "SSG": "bg-sale-ssg",
  "오늘의집": "bg-sale-ohouse",
  "29CM": "bg-sale-29cm",
  "WCONCEPT": "bg-sale-wconcept",
  "커뮤니티 핫딜": "bg-sale-community",
};

export const platformEmojis: Record<Platform, string> = {
  "쿠팡": "🚀",
  "올리브영": "💚",
  "무신사": "🖤",
  "KREAM": "👟",
  "SSG": "🛒",
  "오늘의집": "🏠",
  "29CM": "✨",
  "WCONCEPT": "👗",
  "커뮤니티 핫딜": "🔥",
};

/* ── 카드 프로모션 필터 키워드 ── */
const CARD_PROMO_KEYWORDS = [
  "카드사", "삼성카드", "신한카드", "국민카드", "현대카드", "롯데카드", "우리카드", "하나카드", "BC카드",
  "결제혜택", "청구할인", "카드할인", "카드혜택", "카드결제",
];
const CARD_KEYWORD = "카드";

/** Returns true if the title looks like a standalone credit card promo, not a major sale */
export function isCreditCardPromo(title: string): boolean {
  const t = title.toLowerCase();
  // Direct match on specific card promo keywords
  if (CARD_PROMO_KEYWORDS.some(kw => t.includes(kw.toLowerCase()))) return true;
  // Generic "카드" keyword — only flag if no major sale indicators present
  if (t.includes(CARD_KEYWORD) && !t.includes("세일") && !t.includes("페스타") && !t.includes("위크") && !t.includes("할인대전")) return true;
  return false;
}

/** Format date as YYYY-MM-DD in KST (Asia/Seoul) */
const fmt = (d: Date) => {
  const year = d.toLocaleString('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric' });
  const month = d.toLocaleString('en-CA', { timeZone: 'Asia/Seoul', month: '2-digit' });
  const day = d.toLocaleString('en-CA', { timeZone: 'Asia/Seoul', day: '2-digit' });
  return `${year}-${month}-${day}`;
};

/** Get today's date string in KST */
export const getTodayKST = () => fmt(new Date());

/* ── 세일 상태 ── */
export type SaleStatus = "live" | "starting_soon" | "ending_today" | "ended";

const platformWeight: Partial<Record<Platform, number>> = {
  "무신사": 1,
  "쿠팡": 1,
  "올리브영": 1,
};

export function getSaleStatus(sale: Sale): SaleStatus {
  const todayStr = getTodayKST();
  if (sale.end_date < todayStr) return "ended";
  if (sale.start_date <= todayStr && sale.end_date >= todayStr) {
    return sale.end_date === todayStr ? "ending_today" : "live";
  }
  return "starting_soon";
}

export const saleStatusConfig: Record<SaleStatus, { label: string; emoji: string; className: string }> = {
  live: { label: "진행중", emoji: "🟢", className: "bg-green-100 text-green-700 border-green-300" },
  starting_soon: { label: "곧 시작", emoji: "🟡", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  ending_today: { label: "오늘 마감", emoji: "", className: "bg-closing-today-bg text-closing-today border-closing-today/30" },
  ended: { label: "종료", emoji: "⚪", className: "bg-muted text-muted-foreground" },
};

/* ── 랭킹 점수 계산 ── */
export function calculateRankingScore(sale: Sale): number {
  const todayStr = getTodayKST();
  let score = sale.importance_score;

  const daysBetween = (a: string, b: string) => Math.round((new Date(a + "T00:00:00+09:00").getTime() - new Date(b + "T00:00:00+09:00").getTime()) / 86400000);

  // 카드 프로모션 패널티
  if (isCreditCardPromo(sale.sale_name)) {
    score -= 5;
  }

  // 진행중 보너스
  if (sale.start_date <= todayStr && sale.end_date >= todayStr) score += 3;

  // 곧 시작 보너스 (3일 이내)
  const startDiff = daysBetween(sale.start_date, todayStr);
  if (startDiff > 0 && startDiff <= 3) score += 2;

  // 종료 임박 보너스 (2일 이내)
  const endDiff = daysBetween(sale.end_date, todayStr);
  if (endDiff >= 0 && endDiff <= 2) score += 2;

  // 플랫폼 가중치
  score += platformWeight[sale.platform] ?? 0;

  return score;
}

/* ── 랭킹순 정렬 ── */
export function sortByRanking(sales: Sale[]): Sale[] {
  return [...sales].sort((a, b) => calculateRankingScore(b) - calculateRankingScore(a));
}

/* ── 타임라인 상태 ── */
export type TimelineStatus = "ending_today" | "starts_today" | "ending_soon" | "live" | "starting_soon";

export const timelineSections: {
  key: TimelineStatus;
  title: string;
  emoji: string;
  emptyText: string;
}[] = [
  { key: "ending_today", title: "오늘 마감 세일", emoji: "🔴", emptyText: "오늘 마감 세일이 없습니다." },
  { key: "starts_today", title: "오늘 시작하는 세일", emoji: "🔥", emptyText: "오늘 시작하는 세일이 없습니다." },
  { key: "ending_soon", title: "종료 임박 세일", emoji: "⚠️", emptyText: "종료 임박 세일이 없습니다." },
  { key: "live", title: "지금 진행중인 세일", emoji: "🟢", emptyText: "진행중인 세일이 없습니다." },
  { key: "starting_soon", title: "곧 시작하는 세일", emoji: "⏳", emptyText: "곧 시작하는 세일이 없습니다." },
];

function getTimelineStatus(sale: Sale, todayStr: string, _now: Date): TimelineStatus | null {
  const endDate = sale.end_date;
  const startDate = sale.start_date;
  const isActive = startDate <= todayStr && endDate >= todayStr;

  // Calculate day diffs using date strings (safe from timezone issues)
  const daysBetween = (a: string, b: string) => Math.round((new Date(a + "T00:00:00+09:00").getTime() - new Date(b + "T00:00:00+09:00").getTime()) / 86400000);
  const endDaysLeft = daysBetween(endDate, todayStr);
  const startDaysLeft = daysBetween(startDate, todayStr);

  // Priority: ending_today > starts_today > ending_soon > live > starting_soon
  if (endDate === todayStr) return "ending_today";
  if (startDate === todayStr) return "starts_today";
  if (isActive && endDaysLeft >= 0 && endDaysLeft <= 2) return "ending_soon";
  if (isActive) return "live";
  if (startDaysLeft > 0 && startDaysLeft <= 3) return "starting_soon";
  return null;
}

/** Categorize sales into timeline buckets (major + published only, no duplicates) */
export function categorizeTimeline(sales: Sale[]): Record<TimelineStatus, Sale[]> {
  const now = new Date();
  const todayStr = fmt(now);
  const result: Record<TimelineStatus, Sale[]> = {
    ending_today: [],
    starts_today: [],
    ending_soon: [],
    live: [],
    starting_soon: [],
  };

  const majorPublished = sales.filter(
    (s) => s.sale_tier === "major" && s.publish_status === "published"
  );

  const assigned = new Set<string>();

  // Process in priority order
  for (const section of timelineSections) {
    for (const sale of majorPublished) {
      if (assigned.has(sale.id)) continue;
      const status = getTimelineStatus(sale, todayStr, now);
      if (status === section.key) {
        result[section.key].push(sale);
        assigned.add(sale.id);
      }
    }

    // Sort each section
    result[section.key].sort((a, b) => {
      if (section.key === "ending_today" || section.key === "ending_soon") {
        const dateDiff = new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        return dateDiff !== 0 ? dateDiff : b.importance_score - a.importance_score;
      }
      if (section.key === "starting_soon" || section.key === "starts_today") {
        const dateDiff = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        return dateDiff !== 0 ? dateDiff : b.importance_score - a.importance_score;
      }
      return b.importance_score - a.importance_score;
    });
  }

  return result;
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
