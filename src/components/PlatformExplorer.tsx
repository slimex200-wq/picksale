import { Link } from "react-router-dom";
import { Sale, getSaleStatus, platforms, platformSlugs, Platform } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { ChevronRight } from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface Props {
  sales: Sale[];
}

export default function PlatformExplorer({ sales }: Props) {
  const bp = useBreakpoint();
  const platformStats = platforms
    .filter((p) => p !== "커뮤니티 핫딜")
    .map((p) => {
      const platSales = sales.filter((s) => s.platform === p);
      const live = platSales.filter((s) => {
        const st = getSaleStatus(s);
        return st === "live" || st === "ending_today";
      }).length;
      const ending = platSales.filter((s) => getSaleStatus(s) === "ending_today").length;
      return { platform: p, live, ending };
    });

  const PlatformCard = ({ platform, live, ending }: { platform: Platform; live: number; ending: number }) => (
    <Link
      to={`/platform/${platformSlugs[platform]}`}
      className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center gap-2.5 hover:shadow-md transition-shadow group shrink-0"
      style={bp === "mobile" ? { minWidth: "170px" } : undefined}
    >
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-accent">
        <img src={platformLogos[platform]} alt={platform} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-card-foreground block text-[13px] font-bold">{platform}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          {live > 0 && <span className="text-green-600 text-[10px] font-semibold">진행중 {live}</span>}
          {ending > 0 && <span className="text-closing-today text-[10px] font-semibold">오늘마감 {ending}</span>}
          {live === 0 && ending === 0 && <span className="text-muted-foreground text-[10px]">세일 없음</span>}
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  );

  return (
    <section className="space-y-3">
      <h2 className="text-foreground px-1 flex items-center gap-2 text-base sm:text-lg font-bold">
        <span>🏬</span>
        플랫폼별 세일
      </h2>
      {bp === "mobile" ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3">
          {platformStats.map(({ platform, live, ending }) => (
            <PlatformCard key={platform} platform={platform} live={live} ending={ending} />
          ))}
        </div>
      ) : (
        <div className={`grid gap-2 ${bp === "tablet" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
          {platformStats.map(({ platform, live, ending }) => (
            <PlatformCard key={platform} platform={platform} live={live} ending={ending} />
          ))}
        </div>
      )}
    </section>
  );
}
