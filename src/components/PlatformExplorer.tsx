import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sale, getSaleStatus, platforms, platformSlugs, Platform } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import { ChevronRight } from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface Props {
  sales: Sale[];
}

export default memo(function PlatformExplorer({ sales }: Props) {
  const bp = useBreakpoint();
  const platformStats = useMemo(
    () =>
      platforms
        .filter((p) => p !== "커뮤니티 핫딜")
        .map((p) => {
          let live = 0,
            ending = 0;
          for (const s of sales) {
            if (s.platform !== p) continue;
            const st = getSaleStatus(s);
            if (st === "ending_today") {
              ending++;
              live++;
            } else if (st === "live") {
              live++;
            }
          }
          return { platform: p, live, ending };
        }),
    [sales],
  );

  const PlatformCard = ({ platform, live, ending }: { platform: Platform; live: number; ending: number }) => (
    <Link
      to={`/platform/${platformSlugs[platform]}`}
      className="bg-card border border-border rounded-xl px-3 py-3 flex items-center gap-3 hover:shadow-md transition-all group shrink-0"
      style={bp === "mobile" ? { minWidth: "170px" } : undefined}
    >
      {/* 🚨 15년 차의 디테일: 크기 확장(w-10), 패딩 추가(p-1.5), 화이트 배경, 미세한 그림자 */}
      <div className="w-10 h-10 rounded-xl bg-white border border-border/40 flex items-center justify-center p-1.5 shrink-0 shadow-sm">
        {/* 아이콘 자체에도 미세한 라운딩(rounded-md)을 줘서 부드럽게 마감 */}
        <PlatformLogo platform={platform} className="w-full h-full object-contain rounded-md" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-card-foreground block text-[13px] font-bold">{platform}</span>
        <div className="flex items-center gap-1.5 mt-0.5">
          {live > 0 && <span className="text-green-600 text-[10px] font-semibold">진행중 {live}</span>}
          {ending > 0 && <span className="text-destructive text-[10px] font-semibold">오늘 마감 {ending}</span>}
          {live === 0 && ending === 0 && <span className="text-muted-foreground text-[10px]">세일 없음</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
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
});
