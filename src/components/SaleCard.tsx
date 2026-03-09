import { Sale, getSaleStatus, saleStatusConfig, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

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

interface SaleCardProps {
  sale: Sale;
  rank?: number;
}

export default function SaleCard({ sale, rank }: SaleCardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const countdown = countdownText(sale.end_date);
  const isUrgent = countdown.includes("시간") || countdown === "D-1" || countdown === "종료";
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);

  return (
    <div
      className={`w-full bg-card rounded-xl hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden border ${
        isCardPromo ? "border-border opacity-60" : "border-border/60"
      }`}
      onClick={() => navigate(`/sale/${sale.id}`)}
    >
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        {/* Row 1: Status badge + countdown */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`${statusInfo.className} border-0`}
            style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px' }}
          >
            {statusInfo.emoji} {statusInfo.label}
          </Badge>
          <span
            className={`font-semibold whitespace-nowrap ${
              isUrgent ? "text-destructive" : "text-muted-foreground"
            }`}
            style={{ fontSize: '11px' }}
          >
            {countdown}
          </span>
        </div>

        {/* Row 2: Title */}
        <h3
          className={`line-clamp-2 ${isCardPromo ? "text-muted-foreground" : "text-card-foreground"}`}
          style={{ fontSize: '15px', fontWeight: '650', lineHeight: '1.35' }}
        >
          {sale.sale_name}
        </h3>

        {/* Row 3: Platform + Date */}
        <div className="flex items-center gap-2">
          <div className="w-4.5 h-4.5 rounded bg-accent flex items-center justify-center shrink-0 p-0.5">
            <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain rounded-sm" loading="lazy" />
          </div>
          <span className="text-foreground" style={{ fontSize: '12px', fontWeight: '500' }}>
            {sale.platform}
          </span>
          <span className="text-muted-foreground" style={{ fontSize: '11px' }}>
            {formatDate(sale.start_date)} – {formatDate(sale.end_date)}
          </span>
        </div>

        {/* Row 4: Categories (desktop only) */}
        {!isMobile && sale.category.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sale.category.slice(0, 3).map((c) => (
              <span key={c} className="text-muted-foreground bg-accent rounded px-1.5 py-0.5" style={{ fontSize: '10px', fontWeight: '500' }}>
                {c}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          className="mt-auto w-full rounded-lg text-xs font-semibold h-8 flex items-center justify-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/sale/${sale.id}`);
          }}
        >
          세일 보러가기
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
