import { useState } from "react";
import { Sale, getSaleStatus, saleStatusConfig, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function countdownText(endDate: string) {
  const diffMs = new Date(endDate).getTime() - Date.now();
  if (diffMs <= 0) return "종료";
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}시간 남음`;
  const days = Math.ceil(diffMs / 86400000);
  if (days === 1) return "D-1";
  return `D-${days}`;
}

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

interface HeroSaleCardProps {
  sale: Sale;
  rank?: number;
  isActive?: boolean;
  onGoPrev?: () => void;
  onGoNext?: () => void;
  isMobile?: boolean;
}

export default function HeroSaleCard({ sale, rank, isActive = true, onGoPrev, onGoNext, isMobile }: HeroSaleCardProps) {
  const navigate = useNavigate();
  const countdown = countdownText(sale.end_date);
  const isUrgent = countdown.includes("시간") || countdown === "D-1" || countdown === "종료";
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const [hoverZone, setHoverZone] = useState<"left" | "center" | "right" | null>(null);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    if ((e.target as HTMLElement).closest("button")) return;
    navigate(`/sale/${sale.id}`);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    if (pct < 0.2 && onGoPrev) setHoverZone("left");
    else if (pct > 0.8 && onGoNext) setHoverZone("right");
    else setHoverZone("center");
  };

  return (
    <div
      className={`relative w-full h-full bg-card flex flex-col overflow-hidden ${
        isCardPromo ? "opacity-60" : ""
      }`}
      style={{ cursor: isActive ? (hoverZone === "left" || hoverZone === "right" ? "pointer" : "pointer") : undefined }}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverZone(null)}
    >
      {/* Hover zone indicators — desktop only */}
      {isActive && !isMobile && hoverZone === "left" && onGoPrev && (
        <div className="absolute left-0 top-0 bottom-0 w-[20%] z-20 flex items-center justify-center bg-foreground/5 rounded-l-xl transition-opacity">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      {isActive && !isMobile && hoverZone === "right" && onGoNext && (
        <div className="absolute right-0 top-0 bottom-0 w-[20%] z-20 flex items-center justify-center bg-foreground/5 rounded-r-xl transition-opacity">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Top: Platform banner */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1.5">
        <div className="w-5 h-5 rounded bg-accent flex items-center justify-center shrink-0 p-0.5">
          <img
            src={platformLogos[sale.platform]}
            alt={sale.platform}
            className="w-full h-full object-contain rounded-sm"
            loading="lazy"
          />
        </div>
        <span className="text-foreground font-semibold" style={{ fontSize: "12px" }}>
          {sale.platform}
        </span>
        <Badge
          variant="outline"
          className={`${statusInfo.className} border-0 ml-auto`}
          style={{ fontSize: "10px", fontWeight: "600", padding: "1px 6px" }}
        >
          {statusInfo.emoji} {statusInfo.label}
        </Badge>
      </div>

      {/* Title */}
      <div className="px-3 pt-1">
        <h3
          className={`line-clamp-2 ${isCardPromo ? "text-muted-foreground" : "text-card-foreground"}`}
          style={{ fontSize: "13px", fontWeight: "700", lineHeight: "1.35" }}
        >
          {rank && (
            <span className="text-primary mr-1" style={{ fontSize: "12px" }}>
              #{rank}
            </span>
          )}
          {sale.sale_name}
        </h3>
      </div>

      {/* Brand Logo — visual center */}
      <div className="flex-1 flex items-center justify-center px-4 py-2 min-h-0">
        <img
          src={platformLogos[sale.platform]}
          alt={sale.platform}
          className="object-contain"
          style={{ maxHeight: 120, maxWidth: "80%", opacity: 0.9 }}
          loading="lazy"
        />
      </div>

      {/* Meta: date + countdown */}
      <div className="px-3 flex items-center justify-between">
        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
          {formatDate(sale.start_date)} – {formatDate(sale.end_date)}
        </span>
        <span
          className={`font-semibold ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}
          style={{ fontSize: "11px" }}
        >
          {countdown}
        </span>
      </div>

      {/* Categories — only when active */}
      {isActive && sale.category.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pt-1.5">
          {sale.category.slice(0, 3).map((c) => (
            <span
              key={c}
              className="text-muted-foreground bg-accent rounded px-1.5 py-0.5"
              style={{ fontSize: "9px", fontWeight: "500" }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {/* CTA — only when active */}
      {isActive && (
        <div className="px-3 pb-3 pt-2 mt-auto relative z-30">
          <button
            className="w-full rounded-lg text-xs font-semibold h-7 flex items-center justify-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sale/${sale.id}`);
            }}
          >
            세일 보러가기
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Spacer when not active (no CTA) */}
      {!isActive && <div className="pb-3" />}
    </div>
  );
}
