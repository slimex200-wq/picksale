import { Sale } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import SaleBannerImage from "@/components/SaleBannerImage";
import { ArrowRight } from "lucide-react";

interface Props {
  platform: string;
  sales: Sale[];
  onOpenDetail?: (sale: Sale) => void;
}

/**
 * Grouped card for the "오늘 마감" section.
 * Shows a single card per platform when multiple ending-today sales exist.
 */
export default function EndingTodayGroupCard({ platform, sales, onOpenDetail }: Props) {
  const representative = sales[0];
  const count = sales.length;

  const handleClick = () => {
    if (count === 1 && onOpenDetail) {
      onOpenDetail(representative);
    }
  };

  // For single sale, behave like a normal card
  if (count === 1) {
    return (
      <div
        className="w-full bg-card cursor-pointer flex items-center gap-2.5 overflow-hidden transition-all hover:shadow-sm active:scale-[0.99]"
        style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid hsl(var(--border))", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        onClick={handleClick}
      >
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <PlatformLogo platform={representative.platform} className="w-full h-full object-contain rounded-[22%] border border-border" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="line-clamp-2 tracking-tight leading-snug text-card-foreground"
            style={{ fontSize: "13px", fontWeight: "700", lineHeight: "1.35" }}
          >
            {representative.sale_name}
          </h3>
          <span className="text-muted-foreground text-[11px] font-medium">{platform}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    );
  }

  // Multiple sales → grouped card
  return (
    <div
      className="w-full bg-card cursor-pointer flex items-center gap-2.5 overflow-hidden transition-all hover:shadow-sm active:scale-[0.99]"
      style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid hsl(var(--border))", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
      onClick={() => onOpenDetail?.(representative)}
    >
      <div className="w-10 h-10 flex items-center justify-center shrink-0">
        <PlatformLogo platform={representative.platform} className="w-full h-full object-contain rounded-[22%] border border-border" />
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className="tracking-tight leading-snug text-card-foreground"
          style={{ fontSize: "13px", fontWeight: "700", lineHeight: "1.35" }}
        >
          {platform}
        </h3>
        <span className="text-primary text-[11px] font-semibold">
          진행 중인 세일 {count}건
        </span>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  );
}

/* ─── Editorial variant for PeekCarousel (desktop) ─── */
export function EndingTodayGroupEditorialCard({ platform, sales, onOpenDetail }: Props) {
  const representative = sales[0];
  const count = sales.length;

  const handleClick = () => {
    if (onOpenDetail) onOpenDetail(representative);
  };

  return (
    <div
      className="relative w-full h-full bg-card flex flex-col overflow-hidden cursor-pointer group"
      style={{ minHeight: 280, borderRadius: 12 }}
      onClick={handleClick}
    >
      <SaleBannerImage imageUrl={representative.image_url} platform={representative.platform} alt={representative.sale_name} aspectRatio="2/1" />
      <div className="relative z-10 flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <PlatformLogo platform={representative.platform} className="w-full h-full object-contain rounded-[22%] border border-border" />
          </div>
          <span className="text-foreground/70 font-semibold tracking-tight" style={{ fontSize: 11 }}>{platform}</span>
        </div>
        {count > 1 && (
          <span className="text-primary text-[10px] font-bold rounded-md bg-primary/10 px-1.5 py-0.5">
            {count}건
          </span>
        )}
      </div>
      <div className="flex-1" />
      <div className="relative z-10 px-3 pb-3 space-y-2">
        <h3
          className="line-clamp-2 tracking-tight leading-snug w-[90%] text-card-foreground"
          style={{ fontSize: 14, fontWeight: 700, lineHeight: "1.35" }}
        >
          {count === 1 ? representative.sale_name : `${platform} 오늘 마감 세일`}
        </h3>
        {count > 1 && (
          <p className="text-primary text-[11px] font-semibold">
            진행 중인 세일 {count}건
          </p>
        )}
        <button
          className="w-full rounded-lg text-xs font-semibold h-7 flex items-center justify-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
        >
          {count === 1 ? "세일 보러가기" : "세일 목록 보기"}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
