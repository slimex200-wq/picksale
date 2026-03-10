// src/data/platformLogos.ts
import type { Platform } from "@/data/salesUtils";
import communityIcon from "@/assets/community_icon.svg";

const getLogo = (domain: string) => `https://logo.clearbit.com/${domain}`;

export const platformLogos: Record<Platform, string> = {
  쿠팡: getLogo("coupang.com"),
  올리브영: getLogo("oliveyoung.co.kr"),
  무신사: getLogo("musinsa.com"),
  KREAM: getLogo("kream.co.kr"),
  SSG: getLogo("ssg.com"),
  오늘의집: getLogo("ohou.se"),
  "29CM": getLogo("29cm.co.kr"),
  WCONCEPT: getLogo("wconcept.co.kr"),
  "커뮤니티 핫딜": communityIcon,
};
