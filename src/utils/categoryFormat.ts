/**
 * Canonical category display formatter.
 * DB values may be Korean or mixed-case English; this maps them all
 * to a single lowercase-English canonical label for UI display.
 */

const CATEGORY_MAP: Record<string, string> = {
  // Korean → English
  "패션": "fashion",
  "뷰티": "beauty",
  "라이프스타일": "lifestyle",
  "테크": "tech",
  "식품": "food",
  "리빙": "living",
  "스포츠": "sports",
  "럭셔리": "luxury",
  "키즈": "kids",
  "아웃도어": "outdoor",
  // Mixed-case English normalisation
  "Fashion": "fashion",
  "Beauty": "beauty",
  "Lifestyle": "lifestyle",
  "Tech": "tech",
  "Food": "food",
  "Living": "living",
  "Sports": "sports",
  "Luxury": "luxury",
  "Kids": "kids",
  "Outdoor": "outdoor",
};

/** Return the canonical display string for a category value. */
export function formatCategory(raw: string): string {
  return CATEGORY_MAP[raw] ?? raw.toLowerCase();
}
