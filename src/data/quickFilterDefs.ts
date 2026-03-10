import type { Sale } from "@/data/salesUtils";
import { getSaleStatus } from "@/data/salesUtils";

/**
 * Quick filter definition.
 * `key` is the internal enum value; `null` = show all.
 * `categoryKeywords` lists Korean category strings that match this filter.
 */
export interface QuickFilterDef {
  key: string | null;
  label: string;
  emoji: string;
  dot?: boolean;
  categoryKeywords?: string[];
}

export const QUICK_FILTER_DEFS: QuickFilterDef[] = [
  { key: null, label: "전체 세일", emoji: "🛍" },
  { key: "ending_today", label: "오늘 마감", emoji: "", dot: true },
  { key: "fashion", label: "패션", emoji: "👟", categoryKeywords: ["패션", "fashion", "의류", "잡화"] },
  { key: "beauty", label: "뷰티", emoji: "💄", categoryKeywords: ["뷰티", "beauty", "화장품", "코스메틱"] },
  { key: "home_living", label: "가전·리빙", emoji: "🏠", categoryKeywords: ["리빙", "living", "가전", "생활", "인테리어", "홈"] },
  { key: "furniture", label: "가구", emoji: "🛋", categoryKeywords: ["가구", "furniture", "수납", "침구"] },
  { key: "computer_digital", label: "컴퓨터·디지털", emoji: "💻", categoryKeywords: ["컴퓨터", "디지털", "전자기기", "tech", "테크", "IT", "모바일"] },
  { key: "food", label: "식품", emoji: "🍽", categoryKeywords: ["식품", "food", "먹거리", "음료", "신선"] },
  { key: "kids", label: "육아·키즈", emoji: "👶", categoryKeywords: ["키즈", "kids", "육아", "아동", "유아"] },
  { key: "sports_leisure", label: "스포츠·레저", emoji: "⚽", categoryKeywords: ["스포츠", "sports", "레저", "아웃도어", "outdoor", "운동", "캠핑"] },
  { key: "hobby_stationery", label: "취미·문구", emoji: "✏️", categoryKeywords: ["취미", "문구", "hobby", "도서", "악기"] },
  { key: "pets", label: "반려동물", emoji: "🐾", categoryKeywords: ["반려동물", "pets", "펫", "애완"] },
];

/** Check if a sale matches a quick filter key */
export function matchesQuickFilter(sale: Sale, filterKey: string): boolean {
  if (filterKey === "ending_today") {
    return getSaleStatus(sale) === "ending_today";
  }
  const def = QUICK_FILTER_DEFS.find((d) => d.key === filterKey);
  if (!def?.categoryKeywords) return false;
  return sale.category.some((cat) => {
    const lower = cat.toLowerCase();
    return def.categoryKeywords!.some((kw) => lower.includes(kw.toLowerCase()));
  });
}
