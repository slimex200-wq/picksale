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

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export const mockSales: Sale[] = [
  {
    id: "1",
    platform: "올리브영",
    sale_name: "올영세일",
    start_date: fmt(today),
    end_date: fmt(addDays(today, 6)),
    category: ["뷰티", "스킨케어"],
    link: "https://www.oliveyoung.co.kr",
    description: "올리브영 전 카테고리 최대 50% 할인! 인기 브랜드 특가와 1+1 이벤트가 함께 진행됩니다.",
  },
  {
    id: "2",
    platform: "쿠팡",
    sale_name: "쿠팡 로켓배송 슈퍼세일",
    start_date: fmt(today),
    end_date: fmt(addDays(today, 3)),
    category: ["전자제품", "생활용품"],
    link: "https://www.coupang.com",
    description: "로켓배송 상품 최대 70% 할인. 가전, 생활용품, 식품 등 다양한 카테고리 할인.",
  },
  {
    id: "3",
    platform: "무신사",
    sale_name: "무신사 시즌오프",
    start_date: fmt(addDays(today, -3)),
    end_date: fmt(addDays(today, 4)),
    category: ["패션", "의류"],
    link: "https://www.musinsa.com",
    description: "겨울 시즌오프! 최대 80% 할인. 인기 브랜드 한정 수량 특가.",
  },
  {
    id: "4",
    platform: "KREAM",
    sale_name: "KREAM 한정 드로우",
    start_date: fmt(addDays(today, -5)),
    end_date: fmt(addDays(today, 1)),
    category: ["스니커즈", "한정판"],
    link: "https://www.kream.co.kr",
    description: "나이키, 뉴발란스 한정판 스니커즈 드로우 이벤트. 리셀가 이하 특가.",
  },
  {
    id: "5",
    platform: "SSG",
    sale_name: "SSG 쓱데이",
    start_date: fmt(addDays(today, 2)),
    end_date: fmt(addDays(today, 5)),
    category: ["식품", "패션", "리빙"],
    link: "https://www.ssg.com",
    description: "SSG닷컴 최대 규모 할인 행사. 전 카테고리 쿠폰 + 적립금 혜택.",
  },
  {
    id: "6",
    platform: "오늘의집",
    sale_name: "오늘의집 봄맞이 인테리어 페스타",
    start_date: fmt(addDays(today, -1)),
    end_date: fmt(addDays(today, 10)),
    category: ["가구", "인테리어"],
    link: "https://ohou.se",
    description: "봄맞이 인테리어 가구, 소품 최대 60% 할인. 무료배송 이벤트 동시 진행.",
  },
  {
    id: "7",
    platform: "29CM",
    sale_name: "29CM 위클리 에디션",
    start_date: fmt(addDays(today, 1)),
    end_date: fmt(addDays(today, 7)),
    category: ["패션", "라이프스타일"],
    link: "https://www.29cm.co.kr",
    description: "이번 주 에디터 픽! 엄선된 브랜드 최대 40% 할인.",
  },
  {
    id: "8",
    platform: "쿠팡",
    sale_name: "쿠팡 골드박스",
    start_date: fmt(addDays(today, -7)),
    end_date: fmt(addDays(today, 0)),
    category: ["전자제품", "식품"],
    link: "https://www.coupang.com",
    description: "매일 업데이트되는 골드박스 한정 특가! 수량 소진 시 종료.",
  },
  {
    id: "9",
    platform: "올리브영",
    sale_name: "올리브영 브랜드위크",
    start_date: fmt(addDays(today, 3)),
    end_date: fmt(addDays(today, 9)),
    category: ["뷰티", "헤어케어"],
    link: "https://www.oliveyoung.co.kr",
    description: "인기 브랜드 주간 할인! 최대 40% + 추가 쿠폰 혜택.",
  },
  {
    id: "10",
    platform: "무신사",
    sale_name: "무신사 스프링 페스티벌",
    start_date: fmt(addDays(today, 5)),
    end_date: fmt(addDays(today, 12)),
    category: ["패션", "액세서리"],
    link: "https://www.musinsa.com",
    description: "봄 신상 런칭 기념 최대 50% 할인 + 무료배송.",
  },
];

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
      return diff >= 0 && diff <= 2 && s.start_date !== todayStr;
    })
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());

  return { startsToday, ongoing, endingSoon };
}
