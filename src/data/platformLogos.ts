// src/data/platformLogos.ts
import type { Platform } from "@/data/salesUtils";
import communityIcon from "@/assets/community_icon.svg";

const getAppIcon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

export const platformLogos: Record<Platform, string> = {
  쿠팡: getAppIcon("https://www.coupang.com"),
  올리브영: getAppIcon("https://www.oliveyoung.co.kr"),
  무신사: getAppIcon("https://www.musinsa.com"),
  KREAM: getAppIcon("https://kream.co.kr"),
  SSG: getAppIcon("https://www.ssg.com"),
  오늘의집: getAppIcon("https://ohou.se"),
  "29CM": getAppIcon("https://www.29cm.co.kr"),
  WCONCEPT: getAppIcon("https://www.wconcept.co.kr"),
  "커뮤니티 핫딜": communityIcon,
};
