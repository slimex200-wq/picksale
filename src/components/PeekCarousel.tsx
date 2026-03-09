import { useRef, useState, useEffect, useCallback, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  children: ReactNode[];
  cardWidth?: number;
  gap?: number;
}

export default function PeekCarousel({ children, cardWidth = 210, gap = 12 }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const count = children.length;

  const updateActive = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const idx = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.max(0, Math.min(count - 1, idx)));
  }, [cardWidth, gap, count]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActive, { passive: true });
    return () => el.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  const scrollTo = useCallback(
    (idx: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const target = Math.max(0, Math.min(count - 1, idx));
      el.scrollTo({ left: target * (cardWidth + gap), behavior: "smooth" });
    },
    [cardWidth, gap, count]
  );

  if (count === 0) return null;

  return (
    <div
      className="relative group overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Scroll container with snap */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{
          gap,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingLeft: 12,
          paddingRight: 48,
          paddingBottom: 8,
          maxWidth: "100%",
        }}
      >
        {children.map((child, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={i}
              style={{
                minWidth: cardWidth,
                width: cardWidth,
                scrollSnapAlign: "start",
                transform: isActive ? "scale(1)" : "scale(0.94)",
                opacity: isActive ? 1 : 0.8,
                boxShadow: isActive
                  ? "0 4px 16px -4px hsl(var(--foreground) / 0.1)"
                  : "0 1px 4px -1px hsl(var(--foreground) / 0.06)",
                transition: "transform 0.28s ease, opacity 0.28s ease, box-shadow 0.28s ease",
                borderRadius: 12,
              }}
              className="shrink-0"
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* Left arrow */}
      {activeIndex > 0 && (
        <button
          onClick={() => scrollTo(activeIndex - 1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card border border-border shadow flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: hovered ? 0.9 : 0 }}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
        </button>
      )}

      {/* Right arrow */}
      {activeIndex < count - 1 && (
        <button
          onClick={() => scrollTo(activeIndex + 1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card border border-border shadow flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: hovered ? 0.9 : 0 }}
        >
          <ChevronRight className="w-3.5 h-3.5 text-foreground" />
        </button>
      )}
    </div>
  );
}
