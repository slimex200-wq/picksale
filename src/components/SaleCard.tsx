import { Sale, getSaleStatus, saleStatusConfig, calculateRankingScore, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function getCategoryColor(category: string): string {
  const colorMap: { [key: string]: string } = {
    "패션": "bg-pink-100 text-pink-700",
    "뷰티": "bg-purple-100 text-purple-700",
    "리빙": "bg-blue-100 text-blue-700",
    "식품": "bg-orange-100 text-orange-700",
    "전자": "bg-cyan-100 text-cyan-700",
    "스포츠": "bg-green-100 text-green-700",
    "도서": "bg-amber-100 text-amber-700",
  };
  return colorMap[category] || "bg-secondary/80 text-secondary-foreground";
}

function getSourceLabel(sale: Sale): { label: string; className: string } {
  if (sale.platform === "커뮤니티 핫딜") {
    return { label: "COMMUNITY", className: "bg-orange-100 text-orange-700 border-orange-300" };
  }
  if (sale.signal_id) {
    return { label: "USER", className: "bg-blue-100 text-blue-700 border-blue-300" };
  }
  return { label: "OFFICIAL", className: "bg-green-100 text-green-700 border-green-300" };
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
  const source = getSourceLabel(sale);
  const isEndingToday = status === "ending_today";

  return (
    <div
      className={`w-full bg-card rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden animate-fade-in border ${
        isEndingToday
          ? "border-red-200 bg-red-50/30"
          : isCardPromo
            ? "border-border opacity-70"
            : "border-border/50"
      }`}
      onClick={() => navigate(`/sale/${sale.id}`)}
    >
      {/* Header */}
      <div className={`px-3 py-2 flex items-center gap-1.5 ${isEndingToday ? "bg-red-50/60" : "bg-muted/50"}`}>
        <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${statusInfo.className}`}>
          {statusInfo.emoji} {statusInfo.label}
        </Badge>
        <Badge variant="outline" className={`text-[9px] font-semibold px-1.5 py-0 ${source.className}`}>
          {source.label}
        </Badge>
        {rank && !isCardPromo && (
          <span className="text-foreground font-extrabold text-[10px] bg-muted rounded-full w-5 h-5 flex items-center justify-center shrink-0">
            {rank}
          </span>
        )}
        <span
          className={`ml-auto text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full ${
            isUrgent ? "bg-red-100/80 text-red-700" : "bg-muted text-muted-foreground"
          }`}
        >
          {countdown}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
        <h3 className={`font-semibold leading-[1.3] line-clamp-2 ${
          isCardPromo ? "text-muted-foreground" : "text-card-foreground"
        }`} style={{ fontSize: '18px', fontWeight: '600' }}>
          {sale.sale_name}
        </h3>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white/90 flex items-center justify-center shrink-0 p-0.5">
            <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain rounded-sm" />
          </div>
          <span className="text-[11px] font-bold text-foreground">{sale.platform}</span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {formatDate(sale.start_date)} ~ {formatDate(sale.end_date)}
          </span>
        </div>

        {/* Categories — hidden on mobile to save space */}
        <div className="hidden sm:flex flex-wrap gap-1.5">
          {sale.category.map((cat) => (
            <Badge key={cat} className={`text-[10px] font-semibold rounded-full px-2.5 py-0.5 ${getCategoryColor(cat)}`}>
              {cat}
            </Badge>
          ))}
        </div>

        {isEndingToday && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-red-700 flex items-center gap-1.5">
            ⏰ {countdown === "종료" ? "세일이 종료되었습니다" : `마감까지 ${countdown}`}
          </div>
        )}

        <div className="mt-auto pt-1.5">
          <Button
            size="sm"
            className="w-full rounded-xl text-xs font-semibold gap-1.5 h-8 sm:h-9"
            variant={isCardPromo ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sale/${sale.id}`);
            }}
          >
            세일 보러가기
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
