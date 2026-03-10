import { useState } from "react";
import { formatCategory } from "@/utils/categoryFormat";
import { Sale, getSaleStatus, saleStatusConfig, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { countdownText, isUrgentCountdown, formatDate } from "@/utils/countdown";
import SaleBannerImage from "@/components/SaleBannerImage";

interface HeroSaleCardProps {
  sale: Sale;
  rank?: number;
  isActive?: boolean;
  onGoPrev?: () => void;
  onGoNext?: () => void;
  isMobile?: boolean;
  onOpenDetail?: (sale: Sale) => void;
}

export default function HeroSaleCard({ sale, rank, isActive = true, onGoPrev, onGoNext, isMobile, onOpenDetail }: HeroSaleCardProps) {
  const navigate = useNavigate();
  const countdown = countdownText(sale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const [hoverZone, setHoverZone] = useState<"left" | "center" | "right" | null>(null);

  const handleOpen = () => {
    if (!isActive) return;
    if (onOpenDetail) onOpenDetail(sale);
    else navigate(`/sale/${sale.id}`);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    if ((e.target as HTMLElement).closest("button")) return;
    handleOpen();
  };

  const handleMouseMove = () => {
    if (!isActive || isMobile) return;
    setHoverZone("center");
  };

  return (
    <div
      className={`relative w-full h-full bg-card flex flex-col overflow-hidden ${isCardPromo ? "opacity-60" : ""}`}
      style={{ cursor: isActive ? "pointer" : undefined }}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverZone(null)}
    >
      <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
        <div className="w-6 h-6 rounded-md bg-white/90 shadow-sm flex items-center justify-center shrink-0 p-0.5">
          <PlatformLogo platform={sale.platform} />
        </div>
        <span className="text-foreground font-semibold tracking-tight" style={{ fontSize: "12px" }}>{sale.platform}</span>
        {status === "ending_today" ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today ml-auto" style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
            오늘 마감
          </span>
        ) : (
          <Badge variant="outline" className={`${statusInfo.className} border-0 ml-auto`} style={{ fontSize: "10px", fontWeight: "600", padding: "1px 6px" }}>
            {statusInfo.emoji} {statusInfo.label}
          </Badge>
        )}
      </div>
      <div className="px-3 pt-1">
        <h3
          className={`line-clamp-2 tracking-tight leading-snug ${isCardPromo ? "text-muted-foreground" : "text-card-foreground"}`}
          style={{ fontSize: "13px", fontWeight: "700", lineHeight: "1.35" }}
        >
          {rank && <span className="text-primary mr-1" style={{ fontSize: "12px" }}>#{rank}</span>}
          {sale.sale_name}
        </h3>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <SaleBannerImage imageUrl={sale.image_url} platform={sale.platform} alt={sale.sale_name} heightClass="h-full" />
      </div>
      <div className="px-3 flex items-center justify-between">
        <span className="text-muted-foreground font-normal" style={{ fontSize: "11px" }}>
          {formatDate(sale.start_date)} – {formatDate(sale.end_date)}
        </span>
        <span className={`${isUrgent ? "text-destructive font-semibold" : "text-muted-foreground font-normal"}`} style={{ fontSize: "11px" }}>
          {countdown}
        </span>
      </div>
      {isActive && sale.category.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pt-1.5">
          {sale.category.slice(0, 3).map((c) => (
            <span key={c} className="text-muted-foreground bg-accent rounded px-1.5 py-0.5" style={{ fontSize: "9px", fontWeight: "500" }}>{formatCategory(c)}</span>
          ))}
        </div>
      )}
      {isActive && (
        <div className="px-3 pb-3 pt-2 mt-auto relative z-30">
          <button
            className="w-full rounded-lg text-xs font-semibold h-7 flex items-center justify-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleOpen(); }}
          >
            세일 보러가기
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
      {!isActive && <div className="pb-3" />}
    </div>
  );
}
