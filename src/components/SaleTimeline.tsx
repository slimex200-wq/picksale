import { useMemo } from "react";
import { Sale, categorizeTimeline, timelineSections, TimelineStatus } from "@/data/salesUtils";
import SaleCard from "./SaleCard";

interface Props {
  sales: Sale[];
}

export default function SaleTimeline({ sales }: Props) {
  const timeline = useMemo(() => categorizeTimeline(sales), [sales]);

  const nonEmptySections = timelineSections.filter(
    (s) => timeline[s.key].length > 0
  );

  if (nonEmptySections.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-foreground px-1 flex items-center gap-2">
        <span>📅</span>
        세일 타임라인
      </h2>
      {nonEmptySections.map((section) => (
        <section key={section.key} className="space-y-2.5">
          <h3 className="text-sm font-semibold text-foreground px-1 flex items-center gap-2">
            <span>{section.emoji}</span>
            {section.title}
            <span className="text-xs text-muted-foreground font-medium ml-1">
              {timeline[section.key].length}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {timeline[section.key].map((sale) => (
              <SaleCard key={sale.id} sale={sale} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
