import { Sale, getSaleStatus, saleStatusConfig, calculateRankingScore, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Bell, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function countdownText(endDate: string) {
  const diffMs = new Date(endDate).getTime() - Date.now();
  if (diffMs <= 0) return "종료";
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}시간 남음`;
  const days = Math.ceil(diffMs / 86400000);
  return `${days}일 남음`;
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

interface SaleCardProps {
  sale: Sale;
  rank?: number;
}

export default function SaleCard({ sale, rank }: SaleCardProps) {
  const navigate = useNavigate();
  const countdown = countdownText(sale.end_date);
  const isUrgent = countdown.includes("시간") || countdown === "종료";
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const rankingScore = calculateRankingScore(sale);

  return (
    <div
      className={`w-full bg-card rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden animate-fade-in border ${
        isCardPromo ? "border-border opacity-70" : "border-border/50"
      }`}
      onClick={() => navigate(`/sale/${sale.id}`)}
    >
      {/* Platform strip - Neutral header with state colors */}
      <div className="bg-muted/50 px-4 py-2.5 flex items-center gap-2">
        {rank && !isCardPromo && (
          <span className="text-foreground font-extrabold text-sm bg-muted rounded-full w-6 h-6 flex items-center justify-center shrink-0">
            {rank}
          </span>
        )}
        {/* Logo with background container for visibility */}
        <div className="w-6 h-6 rounded-md bg-white/90 flex items-center justify-center shrink-0 p-0.5">
          <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain rounded-sm" />
        </div>
        <span className="text-[11px] font-bold text-foreground">{sale.platform}</span>
        {isCardPromo && (
          <Badge variant="outline" className="text-[9px] ml-1 bg-muted text-muted-foreground border-border">
            카드 프로모션
          </Badge>
        )}
        <span
          className={`ml-auto text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full ${
            isCardPromo
              ? "bg-muted text-muted-foreground"
              : isUrgent
                ? "bg-red-100/80 text-red-700"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {countdown}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${statusInfo.className}`}>
            {statusInfo.emoji} {statusInfo.label}
          </Badge>
          {!isCardPromo && rankingScore >= 6 && (
            <span className="ml-auto text-[10px] font-semibold text-primary">
              🔥 주요 세일
            </span>
          )}
        </div>

        <h3 className={`font-bold text-[15px] leading-snug tracking-tight ${
          isCardPromo ? "text-muted-foreground" : "text-card-foreground"
        }`}>
          {sale.sale_name}
        </h3>

        <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
          {formatDate(sale.start_date)} ~ {formatDate(sale.end_date)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {sale.category.map((cat) => (
            <Badge
              key={cat}
              className={`text-[10px] font-semibold rounded-full px-2.5 py-0.5 ${getCategoryColor(cat)}`}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <Button
            size="sm"
            className={`flex-1 rounded-xl text-xs font-semibold gap-1.5 h-9 ${isCardPromo ? "bg-muted text-muted-foreground hover:bg-muted/80" : ""}`}
            variant={isCardPromo ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sale/${sale.id}`);
            }}
          >
            {isCardPromo ? "혜택 보기" : "세일 바로가기"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          {!isCardPromo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>세일 알림 받기</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
