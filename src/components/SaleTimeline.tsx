import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sale, categorizeTimeline, timelineSections, platformEmojis, platformColors, getSaleStatus, saleStatusConfig } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";

interface Props {
  sales: Sale[];
}

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function daysLeft(endDate: string) {
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  if (diff <= 0) return "오늘 종료";
  if (diff === 1) return "내일 종료";
  return `D-${diff}`;
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
      <h2 className="text-base font-bold text-foreground px-1 flex items-center gap-2">
        <span>📅</span>
        세일 타임라인
      </h2>
      {nonEmptySections.map((section) => (
        <section key={section.key} className="space-y-1.5">
          <h3 className="text-sm font-semibold text-foreground px-1 flex items-center gap-2">
            <span>{section.emoji}</span>
            {section.title}
            <span className="text-xs text-muted-foreground font-medium ml-1">
              {timeline[section.key].length}
            </span>
          </h3>
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {timeline[section.key].map((sale) => {
              const status = getSaleStatus(sale);
              const statusInfo = saleStatusConfig[status];
              return (
                <div
                  key={sale.id}
                  onClick={() => navigate(`/sale/${sale.id}`)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  {/* Platform indicator */}
                  <div className={`${platformColors[sale.platform]} w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}>
                    <img src={platformLogos[sale.platform]} alt={sale.platform} className="h-4 w-auto object-contain brightness-0 invert" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">{sale.sale_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium">{sale.platform}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(sale.start_date)} — {formatDate(sale.end_date)}
                      </span>
                    </div>
                  </div>

                  {/* Status + D-day */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusInfo.className}`}>
                      {statusInfo.emoji} {statusInfo.label}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {daysLeft(sale.end_date)}
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
