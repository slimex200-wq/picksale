// src/data/platformLogos.ts
import type { Platform } from "@/data/salesUtils";

// 15년 차의 치트키: 구글 Favicon/App Icon 추출 API (절대 안 깨짐, 다운로드 필요 없음)
const getAppIcon = (url: string) =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`;

export const platformLogos: Record<Platform, string> = {
  쿠팡: getAppIcon("https://www.coupang.com"),
  올리브영: getAppIcon("https://www.oliveyoung.co.kr"),
  무신사: getAppIcon("https://www.musinsa.com"),
  KREAM: getAppIcon("https://kream.co.kr"),
  SSG: getAppIcon("https://www.ssg.com"),
  오늘의집: getAppIcon("https://ohou.se"),
  "29CM": getAppIcon("https://www.29cm.co.kr"),
  WCONCEPT: getAppIcon("https://www.wconcept.co.kr"),
  "커뮤니티 핫딜": "https://cdn-icons-png.flaticon.com/128/3502/3502447.png", // 기본 핫딜 아이콘
};
