import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sale, categorizeTimeline, timelineSections, getSaleStatus, saleStatusConfig } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { countdownText, isUrgentCountdown, formatDate } from "@/utils/countdown";

interface Props {
  sales: Sale[];
  onOpenDetail?: (sale: Sale) => void;
}

export default function SaleTimeline({ sales }: Props) {
  const navigate = useNavigate();
  const timeline = useMemo(() => categorizeTimeline(sales), [sales]);

  const nonEmptySections = timelineSections.filter(
    (s) => timeline[s.key].length > 0
  );

  if (nonEmptySections.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-foreground px-1 flex items-center gap-2 tracking-tight">
        <span>📅</span>
        세일 타임라인
      </h2>
      {nonEmptySections.map((section) => (
        <section key={section.key} className="space-y-1.5">
          <h3 className="text-sm font-bold text-foreground px-1 flex items-center gap-2 tracking-tight">
            {section.key === "ending_today" ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today" style={{ fontSize: "12px", fontWeight: 700, padding: "2px 6px" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
                오늘 마감
              </span>
            ) : (
              <>
                <span>{section.emoji}</span>
                {section.title}
              </>
            )}
            <span className="text-xs text-muted-foreground font-medium ml-1">
              {timeline[section.key].length}
            </span>
          </h3>
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {timeline[section.key].map((sale) => {
              const status = getSaleStatus(sale);
              const statusInfo = saleStatusConfig[status];
              const countdown = countdownText(sale.end_date);
              const isUrgent = isUrgentCountdown(countdown);
              const isEndingToday = status === "ending_today";
              return (
                <div
                  key={sale.id}
                  onClick={() => navigate(`/sale/${sale.id}`)}
                  className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-accent p-1">
                    <img src={platformLogos[sale.platform]} alt={sale.platform} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate tracking-tight">{sale.sale_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium">{sale.platform}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-normal">
                        {formatDate(sale.start_date)} — {formatDate(sale.end_date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isEndingToday ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-closing-today-bg text-closing-today" style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px' }}>
                        <span className="w-1 h-1 rounded-full bg-closing-today animate-closing-pulse" />
                        오늘 마감
                      </span>
                    ) : (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusInfo.className}`}>
                        {statusInfo.emoji} {statusInfo.label}
                      </span>
                    )}
                    <span className={`text-[10px] ${isEndingToday ? "text-muted-foreground/40 font-normal" : isUrgent ? "text-destructive font-semibold" : "text-muted-foreground font-normal"}`}>
                      {countdown}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
