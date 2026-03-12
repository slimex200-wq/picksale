import { Sale, isCreditCardPromo, getSaleStatus } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import { useNavigate } from "react-router-dom";
import { countdownText, isUrgentCountdown } from "@/utils/countdown";
import ClosingTodayBadge from "@/components/ClosingTodayBadge";
import LiveCountdownText from "@/components/LiveCountdownText";

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface Props {
  sale: Sale;
  rank: number;
  onOpenDetail?: (sale: Sale) => void;
}

export default function SaleRankingItem({ sale, rank, onOpenDetail }: Props) {
  const navigate = useNavigate();
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const countdown = countdownText(sale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  const status = getSaleStatus(sale);
  const medal = RANK_MEDALS[rank];
  const isEndingToday = status === "ending_today";

  return (
    <div
      onClick={() => onOpenDetail ? onOpenDetail(sale) : navigate(`/sale/${sale.id}`)}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer ${
        isCardPromo ? "opacity-60" : ""
      }`}
    >
      {/* Rank */}
      <span className="shrink-0 w-5 text-center" style={{ fontSize: medal ? '16px' : '14px', fontWeight: '800' }}>
        {medal || <span className={rank <= 5 ? "text-foreground" : "text-muted-foreground"}>{rank}</span>}
      </span>

      {/* Logo */}
      <div className="w-10 h-10 flex items-center justify-center shrink-0">
        <PlatformLogo platform={sale.platform} className="w-full h-full object-contain rounded-[22%] border border-black/5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-card-foreground truncate tracking-tight" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.4' }}>
          {sale.sale_name}
        </h4>
      </div>

      {/* Countdown */}
      {isEndingToday ? (
        <div className="shrink-0 flex items-center gap-1.5">
          <ClosingTodayBadge />
          <LiveCountdownText endDate={sale.end_date} className="text-[10px]" />
        </div>
      ) : (
        <span
          className={`shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md font-display ${
            isUrgent ? "bg-destructive/10 text-destructive font-semibold" : "text-muted-foreground font-normal"
          }`}
          style={{ fontSize: '10px' }}
        >
          {countdown}
        </span>
      )}
    </div>
  );
}
