import { Sale, isCreditCardPromo, getSaleStatus } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { useNavigate } from "react-router-dom";
import { countdownText, isUrgentCountdown } from "@/utils/countdown";

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

interface Props {
  sale: Sale;
  rank: number;
}

export default function SaleRankingItem({ sale, rank }: Props) {
  const navigate = useNavigate();
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const countdown = countdownText(sale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  const status = getSaleStatus(sale);
  const medal = RANK_MEDALS[rank];
  const isEndingToday = status === "ending_today";

  return (
    <div
      onClick={() => navigate(`/sale/${sale.id}`)}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer ${
        isCardPromo ? "opacity-60" : ""
      }`}
    >
      {/* Rank */}
      <span className="shrink-0 w-5 text-center" style={{ fontSize: medal ? '16px' : '14px', fontWeight: '800' }}>
        {medal || <span className={rank <= 5 ? "text-foreground" : "text-muted-foreground"}>{rank}</span>}
      </span>

      {/* Logo */}
      <div className="w-7 h-7 rounded-lg bg-accent border border-border/40 flex items-center justify-center shrink-0 p-1">
        <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain rounded" loading="lazy" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-card-foreground truncate tracking-tight" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.4' }}>
          {sale.sale_name}
        </h4>
      </div>

      {/* Countdown */}
      {isEndingToday ? (
        <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today whitespace-nowrap" style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
          오늘 마감
        </span>
      ) : (
        <span
          className={`shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md ${
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
