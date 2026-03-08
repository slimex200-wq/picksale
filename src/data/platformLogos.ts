import logoCoupang from "@/assets/logo-coupang.png";
import logoOliveyoung from "@/assets/logo-oliveyoung.png";
import logoMusinsa from "@/assets/logo-musinsa.png";
import logoKream from "@/assets/logo-kream.png";
import logoSsg from "@/assets/logo-ssg.png";
import logoOhouse from "@/assets/logo-ohouse.png";
import logo29cm from "@/assets/logo-29cm.png";
import logoEtc from "@/assets/logo-etc.png";
import type { Platform } from "@/data/salesUtils";

export const platformLogos: Record<Platform, string> = {
  "쿠팡": logoCoupang,
  "올리브영": logoOliveyoung,
  "무신사": logoMusinsa,
  "KREAM": logoKream,
  "SSG": logoSsg,
  "오늘의집": logoOhouse,
  "29CM": logo29cm,
  "기타": logoEtc,
};
