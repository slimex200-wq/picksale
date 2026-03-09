import { Sale, getSaleStatus, saleStatusConfig, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { countdownText, isUrgentCountdown } from "@/utils/countdown";

/* ── Platform → oversized initial + brand color (HSL var name) ── */
const brandConfig: Record<string, { initial: string; color: string; bg: string }> = {
  "무신사":       { initial: "M",  color: "hsl(var(--sale-musinsa))",   bg: "hsl(var(--sale-musinsa) / 0.06)" },
  "쿠팡":         { initial: "C",  color: "hsl(var(--sale-coupang))",   bg: "hsl(var(--sale-coupang) / 0.06)" },
  "올리브영":     { initial: "O",  color: "hsl(var(--sale-oliveyoung))", bg: "hsl(var(--sale-oliveyoung) / 0.06)" },
  "KREAM":        { initial: "K",  color: "hsl(var(--sale-kream))",     bg: "hsl(var(--sale-kream) / 0.06)" },
  "SSG":          { initial: "S",  color: "hsl(var(--sale-ssg))",       bg: "hsl(var(--sale-ssg) / 0.06)" },
  "오늘의집":     { initial: "O",  color: "hsl(var(--sale-ohouse))",    bg: "hsl(var(--sale-ohouse) / 0.06)" },
  "29CM":         { initial: "2",  color: "hsl(var(--sale-29cm))",      bg: "hsl(var(--sale-29cm) / 0.06)" },
  "WCONCEPT":     { initial: "W",  color: "hsl(var(--sale-wconcept))",  bg: "hsl(var(--sale-wconcept) / 0.06)" },
  "커뮤니티 핫딜": { initial: "H",  color: "hsl(var(--sale-community))", bg: "hsl(var(--sale-community) / 0.06)" },
};

const fallbackBrand = { initial: "?", color: "hsl(var(--foreground))", bg: "hsl(var(--accent))" };

interface Props {
  sale: Sale;
  rank?: number;
  isActive?: boolean;
  onGoPrev?: () => void;
  onGoNext?: () => void;
}

export default function EditorialBrandCard({ sale, rank, isActive = true }: Props) {
  const navigate = useNavigate();
  const countdown = countdownText(sale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const brand = brandConfig[sale.platform] ?? fallbackBrand;

  return (
    <div
      className={`relative w-full h-full bg-card flex flex-col overflow-hidden cursor-pointer group ${
        isCardPromo ? "opacity-60" : ""
      }`}
      style={{ minHeight: 280 }}
      onClick={() => isActive && navigate(`/sale/${sale.id}`)}
    >
      {/* ── Oversized letterform ── */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          right: -20,
          bottom: -24,
          fontSize: 200,
          fontWeight: 900,
          lineHeight: 1,
          color: brand.color,
          opacity: 0.08,
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          letterSpacing: "-0.04em",
          transition: "opacity 0.3s ease",
        }}
        aria-hidden
      >
        {brand.initial}
      </div>

      {/* ── Top: status badge + platform ── */}
      <div className="relative z-10 flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white/90 shadow-sm flex items-center justify-center shrink-0 p-0.5">
            <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain" loading="lazy" />
          </div>
          <span className="text-foreground/70 font-semibold tracking-tight" style={{ fontSize: 11 }}>
            {sale.platform}
          </span>
        </div>

        {status === "ending_today" ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today" style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
            오늘 마감
          </span>
        ) : (
          <Badge variant="outline" className={`${statusInfo.className} border-0`} style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px" }}>
            {statusInfo.emoji} {statusInfo.label}
          </Badge>
        )}
      </div>

      {/* ── Countdown ── */}
      <div className="relative z-10 px-3 pt-0.5">
        <span className={`${isUrgent ? "text-destructive font-semibold" : "text-muted-foreground/60 font-normal"}`} style={{ fontSize: 11 }}>
          {countdown}
        </span>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Bottom: title + CTA ── */}
      <div className="relative z-10 px-3 pb-3 space-y-2">
        <h3
          className={`line-clamp-2 tracking-tight leading-snug ${isCardPromo ? "text-muted-foreground" : "text-card-foreground"}`}
          style={{ fontSize: 14, fontWeight: 700, lineHeight: "1.35" }}
        >
          {rank && <span className="text-primary mr-1" style={{ fontSize: 12 }}>#{rank}</span>}
          {sale.sale_name}
        </h3>

        {sale.category.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sale.category.slice(0, 2).map((c) => (
              <span key={c} className="text-muted-foreground bg-accent rounded px-1.5 py-0.5" style={{ fontSize: 9, fontWeight: 500 }}>{c}</span>
            ))}
          </div>
        )}

        {isActive && (
          <button
            className="w-full rounded-lg text-xs font-semibold h-7 flex items-center justify-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate(`/sale/${sale.id}`); }}
          >
            세일 보러가기
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {!isActive && <div className="pb-3" />}
    </div>
  );
}
