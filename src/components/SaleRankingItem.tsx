import { Sale, isCreditCardPromo } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { useNavigate } from "react-router-dom";

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function countdownText(endDate: string) {
  const diffMs = new Date(endDate).getTime() - Date.now();
  if (diffMs <= 0) return "종료";
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}h`;
  const days = Math.ceil(diffMs / 86400000);
  return `${days}일`;
}

interface Props {
  sale: Sale;
  rank: number;
}

export default function SaleRankingItem({ sale, rank }: Props) {
  const navigate = useNavigate();
  const isCardPromo = isCreditCardPromo(sale.sale_name);
  const countdown = countdownText(sale.end_date);
  const isUrgent = countdown.includes("h") || countdown === "종료";
  const medal = RANK_MEDALS[rank];

  return (
    <div
      onClick={() => navigate(`/sale/${sale.id}`)}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-card border border-border/50 hover:shadow-sm hover:-translate-y-px transition-all cursor-pointer ${
        isCardPromo ? "opacity-60" : ""
      }`}
    >
      {/* Rank */}
      <span className="shrink-0 w-5 text-center" style={{ fontSize: medal ? '16px' : '14px', fontWeight: '800' }}>
        {medal || <span className={rank <= 5 ? "text-foreground" : "text-muted-foreground"}>{rank}</span>}
      </span>

      {/* Logo */}
      <div className="w-7 h-7 rounded-lg bg-accent border border-border/40 flex items-center justify-center shrink-0 p-0.5">
        <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain rounded" loading="lazy" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-card-foreground truncate" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.4' }}>
          {sale.sale_name}
        </h4>
      </div>

      {/* Countdown */}
      <span
        className={`shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md ${
          isUrgent ? "bg-destructive/10 text-destructive" : "text-muted-foreground"
        }`}
        style={{ fontSize: '10px', fontWeight: '600' }}
      >
        {countdown}
      </span>
    </div>
  );
}
