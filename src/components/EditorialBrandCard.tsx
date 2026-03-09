import { Sale, getSaleStatus, saleStatusConfig, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { countdownText, isUrgentCountdown } from "@/utils/countdown";
import SaleBannerImage from "@/components/SaleBannerImage";

interface Props {
  sale: Sale;
  rank?: number;
  isActive?: boolean;
  onGoPrev?: () => void;
  onGoNext?: () => void;
  onOpenDetail?: (sale: Sale) => void;
}

export default function EditorialBrandCard({ sale, rank, isActive = true, onOpenDetail }: Props) {
  const countdown = countdownText(sale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const logoSrc = platformLogos[sale.platform];

  const handleClick = () => {
    if (isActive && onOpenDetail) onOpenDetail(sale);
  };

  return (
    <div
      className={`relative w-full h-full bg-card flex flex-col overflow-hidden cursor-pointer group ${
        isCardPromo ? "opacity-60" : ""
      }`}
      style={{ minHeight: 280 }}
      onClick={handleClick}
    >
      {/* ── Oversized platform logo (editorial crop effect) ── */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          right: -20,
          bottom: -20,
          width: "85%",
          opacity: 0.12,
          transition: "opacity 0.3s ease",
        }}
        aria-hidden
      >
        <img
          src={logoSrc}
          alt=""
          className="w-full h-auto object-contain"
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* ── Top: status badge + platform ── */}
      <div className="relative z-10 flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white/90 shadow-sm flex items-center justify-center shrink-0 p-0.5">
            <img src={logoSrc} alt={sale.platform} className="w-full h-full object-contain" loading="lazy" />
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
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
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
