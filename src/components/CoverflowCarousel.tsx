import { useState, useCallback, useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoverflowCarouselProps {
  children: ReactNode[];
  /** visible side cards on each side (desktop) */
  visibleSide?: number;
}

export default function CoverflowCarousel({ children, visibleSide = 2 }: CoverflowCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = children.length;

  const go = useCallback(
    (dir: number) => {
      setActiveIndex((prev) => {
        const next = prev + dir;
        if (next < 0) return 0;
        if (next >= count) return count - 1;
        return next;
      });
    },
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

  // Mobile: simple swipeable centered carousel
  if (isMobile) {
    return (
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={containerRef}
      >
        <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
          <div className="relative w-full" style={{ perspective: "800px" }}>
            {children.map((child, i) => {
              const offset = i - activeIndex;
              const isActive = offset === 0;
              const isVisible = Math.abs(offset) <= 1;

              if (!isVisible) return null;

              return (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 transition-all duration-500 ease-out"
                  style={{
                    width: "75%",
                    transform: `translateX(calc(-50% + ${offset * 65}%)) scale(${isActive ? 1 : 0.82}) rotateY(${offset * -8}deg)`,
                    opacity: isActive ? 1 : 0.5,
                    zIndex: isActive ? 10 : 5,
                    filter: isActive ? "none" : "brightness(0.85)",
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  onClick={() => !isActive && setActiveIndex(i)}
                >
                  {child}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        {count > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {children.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-5 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop: coverflow with side cards visible
  const maxSide = visibleSide;

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Navigation arrows */}
      {activeIndex > 0 && (
        <button
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-card/90 border border-border shadow-md flex items-center justify-center hover:bg-card transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
      )}
      {activeIndex < count - 1 && (
        <button
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-card/90 border border-border shadow-md flex items-center justify-center hover:bg-card transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      )}

      <div
        className="flex items-center justify-center py-4"
        style={{ perspective: "1200px", minHeight: 240 }}
      >
        {children.map((child, i) => {
          const offset = i - activeIndex;
          const absOffset = Math.abs(offset);
          const isActive = offset === 0;

          // Only render cards within visible range
          if (absOffset > maxSide) return null;

          // Progressive scaling & opacity
          const scale = isActive ? 1 : Math.max(0.7, 1 - absOffset * 0.12);
          const opacity = isActive ? 1 : Math.max(0.35, 1 - absOffset * 0.25);
          const rotateY = offset * 8; // positive = left card tilts right, negative = right card tilts left
          const translateX = offset * 55; // percentage-based spread
          const zIndex = 10 - absOffset;

          return (
            <div
              key={i}
              className="absolute transition-all duration-500 ease-out"
              style={{
                width: "min(280px, 45%)",
                left: "50%",
                transform: `translateX(calc(-50% + ${translateX}%)) scale(${scale}) rotateY(${rotateY}deg)`,
                opacity,
                zIndex,
                filter: isActive ? "none" : `brightness(${1 - absOffset * 0.08})`,
                cursor: isActive ? "default" : "pointer",
                transformStyle: "preserve-3d",
              }}
              onClick={() => !isActive && setActiveIndex(i)}
            >
              <div
                style={{
                  pointerEvents: isActive ? "auto" : "none",
                  transition: "box-shadow 0.4s ease",
                  boxShadow: isActive
                    ? "0 8px 30px -8px hsl(var(--primary) / 0.15)"
                    : "0 2px 8px -2px hsl(var(--foreground) / 0.08)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {child}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-1">
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
