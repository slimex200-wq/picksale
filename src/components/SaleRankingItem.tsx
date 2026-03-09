import { Sale, getSaleStatus, saleStatusConfig, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

function countdownText(endDate: string) {
  const diffMs = new Date(endDate).getTime() - Date.now();
  if (diffMs <= 0) return "종료";

  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}시간 남음`;
  const days = Math.ceil(diffMs / 86400000);
  return `${days}일 남음`;
}

interface Props {
  sale: Sale;
  rank: number;
}

export default function SaleRankingItem({ sale, rank }: Props) {
  const navigate = useNavigate();
  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const countdown = countdownText(sale.end_date);
  const isUrgent = countdown.includes("시간") || countdown === "종료";

  return (
    <div
      onClick={() => navigate(`/sale/${sale.id}`)}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-card border border-border/50 hover:shadow-card-hover hover:-translate-y-px transition-all cursor-pointer ${
        isCardPromo ? "opacity-70" : ""
      }`}
    >
       {/* Rank */}
       <span className={`font-bold w-5 text-center shrink-0 ${
         rank <= 3 ? "text-primary" : "text-muted-foreground"
       }`} style={{ fontSize: '14px', fontWeight: '700' }}>
         {rank}
       </span>

      {/* Logo */}
      <div className="w-7 h-7 rounded-md bg-white/90 border border-border/50 flex items-center justify-center shrink-0 p-0.5">
        <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain rounded" />
      </div>

       {/* Info */}
       <div className="flex-1 min-w-0">
         <h4 className="font-semibold text-card-foreground truncate" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.4' }}>
           {sale.sale_name}
         </h4>
         <span className="text-muted-foreground truncate block" style={{ fontSize: '11px', fontWeight: '500' }}>{sale.platform}</span>
       </div>

      {/* Countdown */}
      <span className={`text-[10px] font-bold whitespace-nowrap shrink-0 px-1.5 py-0.5 rounded-md ${
        isUrgent
          ? "bg-destructive/10 text-destructive"
          : "bg-accent text-accent-foreground"
      }`}>
        {countdown}
      </span>
    </div>
  );
}
