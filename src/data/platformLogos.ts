// src/data/platformLogos.ts
import type { Platform } from "@/data/salesUtils";
import communityIcon from "@/assets/community_icon.svg";

const getAppIcon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

export const platformLogos: Record<Platform, string> = {
  쿠팡: getAppIcon("coupang.com"),
  올리브영: getAppIcon("oliveyoung.co.kr"),
  무신사: getAppIcon("musinsa.com"),
  KREAM: getAppIcon("kream.co.kr"),
  SSG: getAppIcon("ssg.com"),
  오늘의집: getAppIcon("ohou.se"),
  "29CM": getAppIcon("29cm.co.kr"),
  WCONCEPT: "https://wconcept.co.kr/favicon.ico",
  "커뮤니티 핫딜": communityIcon,
};
