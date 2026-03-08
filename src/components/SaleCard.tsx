import { Sale, platformColors, platformEmojis, getSaleStatus, saleStatusConfig, calculateRankingScore } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function daysLeft(endDate: string) {
  const diff = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / 86400000
  );
  if (diff <= 0) return "오늘 종료";
  if (diff === 1) return "내일 종료";
  return `D-${diff}`;
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
  const colorClass = platformColors[sale.platform];
  const days = daysLeft(sale.end_date);
  const isUrgent = days === "오늘 종료" || days === "내일 종료";
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];

  return (
    <div
      className="w-full bg-card rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden animate-fade-in border border-border/50"
      onClick={() => navigate(`/sale/${sale.id}`)}
    >
      {/* Platform strip */}
      <div className={`${colorClass} px-4 py-2.5 flex items-center gap-2`}>
        {rank && (
          <span className="text-primary-foreground font-extrabold text-sm bg-white/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
            {rank}
          </span>
        )}
        <img src={platformLogos[sale.platform]} alt={sale.platform} className="h-5 w-auto object-contain rounded" />
        <span
          className={`ml-auto text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full ${
            isUrgent
              ? "bg-white/25 text-primary-foreground"
              : "bg-white/15 text-primary-foreground/90"
          }`}
        >
          {days}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${statusInfo.className}`}>
            {statusInfo.emoji} {statusInfo.label}
          </Badge>
        </div>

        <h3 className="font-bold text-[15px] text-card-foreground leading-snug tracking-tight">
          {sale.sale_name}
        </h3>

        <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
          {formatDate(sale.start_date)} — {formatDate(sale.end_date)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {sale.category.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="text-[10px] font-semibold rounded-full px-2.5 py-0.5 bg-secondary/80"
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <Button
            size="sm"
            className="flex-1 rounded-xl text-xs font-semibold gap-1.5 h-9"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sale/${sale.id}`);
            }}
          >
            세일 보기
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-xs h-9 w-9 p-0 border-border/70"
            onClick={(e) => {
              e.stopPropagation();
              toast.success("알림이 설정되었습니다! 🔔");
            }}
          >
            <Bell className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
