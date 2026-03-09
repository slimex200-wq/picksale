import { Sale, getSaleStatus, saleStatusConfig, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
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

interface SaleCardProps {
  sale: Sale;
  rank?: number;
}

export default function SaleCard({ sale, rank }: SaleCardProps) {
  const navigate = useNavigate();
  const countdown = countdownText(sale.end_date);
  const isUrgent = countdown.includes("시간") || countdown === "D-1" || countdown === "종료";
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const isEndingToday = status === "ending_today";

  return (
    <div
      className={`w-full bg-card rounded-2xl hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden border ${
        isEndingToday
          ? "border-destructive/25 bg-destructive/[0.03]"
          : isCardPromo
            ? "border-border opacity-60"
            : "border-border/60"
      }`}
      onClick={() => navigate(`/sale/${sale.id}`)}
    >
      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        {/* Top row: status + countdown */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`${statusInfo.className} border-0`}
            style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', letterSpacing: '0.01em' }}
          >
            {statusInfo.emoji} {statusInfo.label}
          </Badge>
          <span
            className={`font-semibold whitespace-nowrap px-2 py-0.5 rounded-full ${
              isUrgent ? "bg-destructive/10 text-destructive" : "text-muted-foreground"
            }`}
            style={{ fontSize: '12px' }}
          >
            {countdown}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`leading-snug line-clamp-2 ${
            isCardPromo ? "text-muted-foreground" : "text-card-foreground"
          }`}
          style={{ fontSize: '16px', fontWeight: '650', lineHeight: '1.4' }}
        >
          {sale.sale_name}
        </h3>

        {/* Platform + Date */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center shrink-0 p-0.5">
            <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain rounded-sm" loading="lazy" />
          </div>
          <span className="text-foreground" style={{ fontSize: '13px', fontWeight: '500' }}>
            {sale.platform}
          </span>
          <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
            {formatDate(sale.start_date)} – {formatDate(sale.end_date)}
          </span>
        </div>

        {/* Urgency banner */}
        {isEndingToday && (
          <div
            className="bg-destructive/5 border border-destructive/15 rounded-lg px-3 py-2 text-destructive flex items-center gap-1.5"
            style={{ fontSize: '12px', fontWeight: '600' }}
          >
            ⏰ {countdown === "종료" ? "세일이 종료되었습니다" : `마감까지 ${countdown}`}
          </div>
        )}

        {/* CTA */}
        <button
          className="mt-auto w-full rounded-xl text-xs font-semibold h-9 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/sale/${sale.id}`);
          }}
        >
          세일 보러가기
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
