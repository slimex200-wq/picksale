import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sale, getSaleStatus, platforms, platformSlugs, Platform } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

/** Platforms to show (exclude 커뮤니티 핫딜) */
const VISIBLE_PLATFORMS: Platform[] = platforms.filter((p) => p !== "커뮤니티 핫딜");

interface PlatformSummaryProps {
  sales: Sale[];
}

export default function PlatformSummary({ sales }: PlatformSummaryProps) {
  const countByPlatform = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of VISIBLE_PLATFORMS) map[p] = 0;
    for (const s of sales) {
      const st = getSaleStatus(s);
      if (st === "live" || st === "ending_today") {
        if (map[s.platform] !== undefined) map[s.platform]++;
      }
    }
    return map;
  }, [sales]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-3.5 py-3 border-b border-border/60">
        <h3 className="text-sm font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
          <span>🏬</span>
          플랫폼별 현황
        </h3>
      </div>
      <div className="divide-y divide-border/40">
        {VISIBLE_PLATFORMS.map((platform) => {
          const count = countByPlatform[platform] ?? 0;
          const slug = platformSlugs[platform];

          return (
            <Link
              key={platform}
              to={`/platform/${slug}`}
              className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-accent/50 transition-colors group"
            >
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <PlatformLogo
                  platform={platform}
                  className="w-full h-full object-contain rounded-[22%] border border-black/5"
                />
              </div>
              <span className="text-xs font-semibold text-foreground flex-1 truncate">
                {platform}
              </span>
              {count > 0 ? (
                <Badge className="text-[10px] font-bold px-1.5 py-0 h-[18px] bg-primary/10 text-primary border-0 shrink-0">
                  {count}개 진행중
                </Badge>
              ) : (
                <span className="text-[10px] text-muted-foreground/50 font-medium shrink-0">
                  세일 없음
                </span>
              )}
              <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
