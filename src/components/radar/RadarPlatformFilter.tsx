import { useState } from "react";
import { cn } from "@/lib/utils";
import { Platform, platforms } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";

const VISIBLE_PLATFORMS = platforms.filter((p) => p !== "커뮤니티 핫딜");
const INITIAL_COUNT = 4;

interface Props {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export default function RadarPlatformFilter({ selected, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isAllActive = selected.length === 0;

  const handleClick = (p: Platform | null) => {
    if (p === null) {
      onChange([]);
      return;
    }
    if (selected.includes(p)) {
      onChange(selected.filter((x) => x !== p));
    } else {
      onChange([...selected, p]);
    }
  };

  const visible = expanded
    ? VISIBLE_PLATFORMS
    : VISIBLE_PLATFORMS.slice(0, INITIAL_COUNT - 1);

  const showToggle = VISIBLE_PLATFORMS.length > INITIAL_COUNT - 1;

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em]">
        플랫폼
      </span>
      <div className="flex gap-1.5 flex-wrap items-center">
        {/* 전체 chip */}
        <button
          onClick={() => handleClick(null)}
          className={cn(
            "px-2 py-1 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-1 border",
            isAllActive
              ? "bg-muted/30 text-foreground border-foreground/20"
              : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
          )}
        >
          전체
        </button>
        {visible.map((p) => {
          const isActive = selected.includes(p);
          const logo = platformLogos[p];
          return (
            <button
              key={p}
              onClick={() => handleClick(p)}
              className={cn(
                "px-2 py-1 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-1 border",
                isActive
                  ? "bg-muted/30 text-foreground border-foreground/20"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              {logo && (
                <img
                  src={logo}
                  alt=""
                  className="w-4 h-4 rounded object-contain"
                  loading="lazy"
                  draggable={false}
                />
              )}
              {p}
            </button>
          );
        })}
        {showToggle && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-[12px] text-primary font-medium hover:underline whitespace-nowrap"
          >
            {expanded ? "접기" : "더보기"}
          </button>
        )}
      </div>
    </div>
  );
}
