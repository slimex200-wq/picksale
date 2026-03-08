export type Platform = "쿠팡" | "올리브영" | "무신사" | "KREAM" | "SSG" | "오늘의집" | "29CM";

export interface Sale {
  id: string;
  platform: Platform;
  sale_name: string;
  start_date: string;
  end_date: string;
  category: string[];
  link: string;
  description: string;
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
