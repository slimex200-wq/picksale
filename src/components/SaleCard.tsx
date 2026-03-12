import { Sale, getSaleStatus, saleStatusConfig, isCreditCardPromo } from "@/data/salesUtils";
import { formatCategory } from "@/utils/categoryFormat";
import PlatformLogo from "@/components/PlatformLogo";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { countdownText, isUrgentCountdown, formatDate } from "@/utils/countdown";
import ClosingTodayBadge from "@/components/ClosingTodayBadge";
import SaleBannerImage from "@/components/SaleBannerImage";
import { useCountdown } from "@/hooks/useCountdown";

interface SaleCardProps {
  sale: Sale;
  rank?: number;
  isActive?: boolean;
  compact?: boolean;
  onGoPrev?: () => void;
  onGoNext?: () => void;
  onOpenDetail?: (sale: Sale) => void;
}

export default function SaleCard({ sale, rank, isActive = true, compact = false, onGoPrev, onGoNext, onOpenDetail }: SaleCardProps) {
  const navigate = useNavigate();
  const [hoverZone, setHoverZone] = useState<"left" | "center" | "right" | null>(null);
  const countdown = countdownText(sale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);

  const hasZoneNav = !!(onGoPrev || onGoNext);

  const goToSale = () => {
    if (onOpenDetail) {
      onOpenDetail(sale);
    } else {
      navigate(`/sale/${sale.id}`);
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    if ((e.target as HTMLElement).closest("button")) return;

    if (compact || !hasZoneNav) {
      goToSale();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;

    if (pct < 0.2 && onGoPrev) {
      onGoPrev();
    } else if (pct > 0.8 && onGoNext) {
      onGoNext();
    } else {
      goToSale();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasZoneNav || compact) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    if (pct < 0.2 && onGoPrev) setHoverZone("left");
    else if (pct > 0.8 && onGoNext) setHoverZone("right");
    else setHoverZone("center");
  };

  /* ─── Compact layout (mobile) ─── */
  if (compact) {
    return (
      <div
        className={`w-full bg-white cursor-pointer flex items-center gap-2.5 overflow-hidden transition-all hover:shadow-sm active:scale-[0.99] ${
          isCardPromo ? "opacity-60" : ""
        }`}
        style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #eaecf0", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        onClick={goToSale}
      >
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <PlatformLogo platform={sale.platform} className="w-full h-full object-contain rounded-[22%] border border-black/5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {status === "ending_today" ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today shrink-0" style={{ fontSize: "10px", fontWeight: 700, padding: "1px 5px" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
                오늘 마감
              </span>
            ) : (
              <Badge variant="outline" className={`${statusInfo.className} border-0 shrink-0`} style={{ fontSize: "10px", fontWeight: "600", padding: "1px 5px" }}>
                {statusInfo.emoji} {statusInfo.label}
              </Badge>
            )}
            <span className={`text-[10px] shrink-0 font-display ${isUrgent ? "text-destructive font-semibold" : "text-muted-foreground font-normal"}`}>
              {countdown}
            </span>
          </div>
          <h3
            className={`line-clamp-2 tracking-tight leading-snug ${isCardPromo ? "text-muted-foreground" : "text-card-foreground"}`}
            style={{ fontSize: "13px", fontWeight: "700", lineHeight: "1.35" }}
          >
            {rank && <span className="text-primary mr-1 text-xs">#{rank}</span>}
            {sale.sale_name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-muted-foreground text-[11px] font-medium">{sale.platform}</span>
            <span className="text-muted-foreground/60 text-[10px] font-normal">
              {formatDate(sale.start_date)} – {formatDate(sale.end_date)}
            </span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    );
  }

  /* ─── Standard card layout ─── */
  return (
    <div
      className={`relative w-full bg-white hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden ${
        isCardPromo ? "opacity-60" : ""
      }`}
      style={{
        borderRadius: 12,
        border: "1px solid #eaecf0",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      }}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverZone(null)}
    >
      {hasZoneNav && hoverZone === "left" && onGoPrev && (
        <div className="absolute left-0 top-0 bottom-0 w-[20%] z-20 flex items-center justify-center bg-foreground/5 rounded-l-xl transition-opacity">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      {hasZoneNav && hoverZone === "right" && onGoNext && (
        <div className="absolute right-0 top-0 bottom-0 w-[20%] z-20 flex items-center justify-center bg-foreground/5 rounded-r-xl transition-opacity">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <SaleBannerImage imageUrl={sale.image_url} platform={sale.platform} alt={sale.sale_name} aspectRatio="2/1" className="rounded-t-xl" />
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          {status === "ending_today" ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-closing-today-bg text-closing-today" style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
              오늘 마감
            </span>
          ) : (
            <Badge variant="outline" className={`${statusInfo.className} border-0`} style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px' }}>
              {statusInfo.emoji} {statusInfo.label}
            </Badge>
          )}
          <span
            className={`whitespace-nowrap font-display ${isUrgent ? "text-destructive font-semibold" : "text-muted-foreground font-normal"}`}
            style={{ fontSize: '11px' }}
          >
            {countdown}
          </span>
        </div>
        <h3
          className={`line-clamp-2 tracking-tight leading-snug ${isCardPromo ? "text-muted-foreground" : "text-card-foreground"}`}
          style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.35' }}
        >
          {sale.sale_name}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <PlatformLogo platform={sale.platform} className="w-full h-full object-contain rounded-[22%] border border-black/5" />
          </div>
          <span className="text-foreground font-medium" style={{ fontSize: '12px' }}>{sale.platform}</span>
          <span className="text-muted-foreground font-normal" style={{ fontSize: '11px' }}>
            {formatDate(sale.start_date)} – {formatDate(sale.end_date)}
          </span>
        </div>
        {sale.category.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sale.category.slice(0, 3).map((c) => (
              <span key={c} className="text-muted-foreground bg-accent rounded px-1.5 py-0.5" style={{ fontSize: '10px', fontWeight: '500' }}>
                {formatCategory(c)}
              </span>
            ))}
          </div>
        )}
        {isActive && (
          <button
            className="mt-auto w-full rounded-lg text-xs font-semibold h-8 flex items-center justify-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goToSale();
            }}
          >
            세일 보러가기
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
