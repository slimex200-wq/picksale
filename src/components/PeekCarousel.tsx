import { useRef, useState, useEffect, useCallback, ReactNode, isValidElement, cloneElement, ReactElement } from "react";
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
    const step = cardWidth + gap;
    // Find the closest card to the current scroll position
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < count; i++) {
      const dist = Math.abs(scrollLeft - i * step);
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    // If scrolled near the end, activate the last visible card
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0 && scrollLeft >= maxScroll - 10) {
      best = count - 1;
    }
    setActiveIndex(best);
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
      // Loop around
      let target = idx;
      if (target < 0) target = count - 1;
      if (target >= count) target = 0;
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
           const onGoPrev = () => scrollTo(i - 1);
           const onGoNext = () => scrollTo(i + 1);
           
           return (
             <div
               key={i}
               onClick={!isActive ? (e: React.MouseEvent) => { e.stopPropagation(); scrollTo(i); } : undefined}
                style={{
                  minWidth: cardWidth,
                  width: cardWidth,
                  scrollSnapAlign: "start",
                  transform: isActive ? "scale(1)" : "scale(0.94)",
                  opacity: isActive ? 1 : 0.8,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                  border: "1px solid #eaecf0",
                  background: "white",
                  transition: "transform 0.28s ease, opacity 0.28s ease, box-shadow 0.28s ease",
                  borderRadius: 12,
                  cursor: isActive ? undefined : "pointer",
               }}
               className="shrink-0"
             >
               {isValidElement(child)
                 ? cloneElement(child as ReactElement<any>, {
                     isActive,
                     onGoPrev: isActive ? onGoPrev : undefined,
                     onGoNext: isActive ? onGoNext : undefined,
                   })
                 : child}
             </div>
           );
         })}
      </div>

      {/* Left arrow — always visible when count > 1 */}
      {count > 1 && (
        <button
          onClick={() => scrollTo(activeIndex - 1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card border border-border shadow flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: hovered ? 0.9 : 0 }}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
        </button>
      )}

      {/* Right arrow — always visible when count > 1 */}
      {count > 1 && (
        <button
          onClick={() => scrollTo(activeIndex + 1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-card border border-border shadow flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: hovered ? 0.9 : 0 }}
        >
          <ChevronRight className="w-3.5 h-3.5 text-foreground" />
        </button>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="flex justify-center gap-1 pt-2">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i === activeIndex ? "bg-primary w-3" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
