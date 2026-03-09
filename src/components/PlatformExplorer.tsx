import { Link } from "react-router-dom";
import { Sale, getSaleStatus, platforms, platformSlugs, Platform } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { ChevronRight } from "lucide-react";

interface Props {
  sales: Sale[];
}

export default function PlatformExplorer({ sales }: Props) {
  const platformStats = platforms
    .filter((p) => p !== "커뮤니티 핫딜")
    .map((p) => {
      const platSales = sales.filter((s) => s.platform === p);
      const live = platSales.filter((s) => getSaleStatus(s) === "live" || getSaleStatus(s) === "ending_today").length;
      const ending = platSales.filter((s) => getSaleStatus(s) === "ending_today").length;
      return { platform: p, live, ending };
    });

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-extrabold text-foreground px-1 flex items-center gap-2">
        <span>🏬</span>
        플랫폼별 세일
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {platformStats.map(({ platform, live, ending }) => (
          <Link
            key={platform}
            to={`/platform/${platformSlugs[platform]}`}
            className="bg-card border border-border rounded-xl px-3 py-3 flex items-center gap-2.5 hover:shadow-md transition-shadow group"
          >
            <div className="w-9 h-9 rounded-lg bg-accent/60 border border-border/50 flex items-center justify-center p-1 shrink-0">
              <img src={platformLogos[platform]} alt={platform} className="w-full h-full object-contain rounded" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-card-foreground block">{platform}</span>
              <div className="flex items-center gap-2 mt-0.5">
                {live > 0 && (
                  <span className="text-[10px] text-green-600 font-semibold">진행중 {live}</span>
                )}
                {ending > 0 && (
                  <span className="text-[10px] text-red-600 font-semibold">오늘종료 {ending}</span>
                )}
                {live === 0 && ending === 0 && (
                  <span className="text-[10px] text-muted-foreground">세일 없음</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}
