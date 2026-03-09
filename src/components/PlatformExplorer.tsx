import { Link } from "react-router-dom";
import { Sale, getSaleStatus, platforms, platformSlugs, Platform } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  sales: Sale[];
}

export default function PlatformExplorer({ sales }: Props) {
  const isMobile = useIsMobile();
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
      style={isMobile ? { minWidth: "180px" } : undefined}
    >
      <div className="w-8 h-8 rounded-lg bg-accent/60 border border-border/50 flex items-center justify-center p-1 shrink-0">
        <img src={platformLogos[platform]} alt={platform} className="w-full h-full object-contain rounded" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-card-foreground block" style={{ fontSize: '13px', fontWeight: '700' }}>{platform}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          {live > 0 && <span className="text-green-600" style={{ fontSize: '10px', fontWeight: '600' }}>진행중 {live}</span>}
          {ending > 0 && <span className="text-destructive" style={{ fontSize: '10px', fontWeight: '600' }}>오늘종료 {ending}</span>}
          {live === 0 && ending === 0 && <span className="text-muted-foreground" style={{ fontSize: '10px' }}>세일 없음</span>}
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  );

  return (
    <section className="space-y-3">
      <h2 className="text-foreground px-1 flex items-center gap-2" style={{ fontSize: '20px', fontWeight: '700' }}>
        <span>🏬</span>
        플랫폼별 세일
      </h2>
      {isMobile ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {platformStats.map(({ platform, live, ending }) => (
            <PlatformCard key={platform} platform={platform} live={live} ending={ending} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {platformStats.map(({ platform, live, ending }) => (
            <PlatformCard key={platform} platform={platform} live={live} ending={ending} />
          ))}
        </div>
      )}
    </section>
  );
}
