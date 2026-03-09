import { useState, useCallback, useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoverflowCarouselProps {
  children: ReactNode[];
  visibleSide?: number;
}

export default function CoverflowCarousel({ children, visibleSide = 2 }: CoverflowCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);
  const count = children.length;

  const go = useCallback(
    (dir: number) =>
      setActiveIndex((prev) => Math.max(0, Math.min(count - 1, prev + dir))),
    [count]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchRef.current) return;
      const dx = e.changedTouches[0].clientX - touchRef.current.startX;
      const dy = e.changedTouches[0].clientY - touchRef.current.startY;
      touchRef.current = null;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        go(dx < 0 ? 1 : -1);
      }
    },
    [go]
  );

  if (count === 0) return null;

  // Card width in px for precise positioning
  const cardW = isMobile ? 220 : 260;
  const gap = isMobile ? 12 : 20;
  const maxSide = isMobile ? 1 : visibleSide;
  const containerH = isMobile ? 220 : 260;

  return (
    <div
      className="relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ perspective: "1000px" }}
    >
      {/* Arrows — desktop only */}
      {!isMobile && activeIndex > 0 && (
        <button
          onClick={() => go(-1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      )}
      {!isMobile && activeIndex < count - 1 && (
        <button
          onClick={() => go(1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      )}

      {/* Stage */}
      <div
        className="relative mx-auto"
        style={{ height: containerH, transformStyle: "preserve-3d" }}
      >
        {children.map((child, i) => {
          const offset = i - activeIndex;
          const absOffset = Math.abs(offset);
          const isActive = offset === 0;

          if (absOffset > maxSide) return null;

          // Core transforms
          const translateXpx = offset * (cardW * 0.55 + gap);
          const translateZ = isActive ? 60 : -(absOffset * 80);
          const rotateY = offset > 0 ? -35 : offset < 0 ? 35 : 0;
          const scale = isActive ? 1.05 : Math.max(0.75, 1 - absOffset * 0.15);
          const opacity = isActive ? 1 : Math.max(0.5, 1 - absOffset * 0.3);
          const zIndex = 20 - absOffset;

          return (
            <div
              key={i}
              className="absolute top-0"
              style={{
                width: cardW,
                left: "50%",
                marginLeft: -(cardW / 2),
                transform: `translateX(${translateXpx}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
                transition: "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
                transformStyle: "preserve-3d",
                cursor: isActive ? "default" : "pointer",
              }}
              onClick={() => !isActive && setActiveIndex(i)}
            >
              <div
                style={{
                  pointerEvents: isActive ? "auto" : "none",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: isActive
                    ? "0 12px 40px -10px hsl(var(--primary) / 0.2), 0 4px 12px -4px hsl(var(--foreground) / 0.08)"
                    : "0 4px 16px -6px hsl(var(--foreground) / 0.12)",
                  transition: "box-shadow 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
                }}
              >
                {child}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots */}
      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 pb-1">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-5 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
