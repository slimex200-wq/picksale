import { useState, useCallback, useRef, ReactNode, isValidElement, cloneElement, ReactElement } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  children: ReactNode[];
}

const CARD_W = 280;
const CARD_H = 340;
const SIDE_OFFSET = 200;
const VISIBLE = 2;
const DRAG_THRESHOLD = 50;

export default function CoverflowCarousel({ children }: Props) {
  const count = children.length;
  const [active, setActive] = useState(Math.floor(count / 2));
  const isMobile = useIsMobile();

  // Unified drag/touch state
  const dragRef = useRef<{ startX: number; dragging: boolean } | null>(null);

  const go = useCallback(
    (dir: number) =>
      setActive((p) => Math.max(0, Math.min(count - 1, p + dir))),
    [count]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, dragging: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      dragRef.current = null;
      if (Math.abs(dx) > DRAG_THRESHOLD) go(dx < 0 ? 1 : -1);
    },
    [go]
  );

  if (count === 0) return null;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ minHeight: 430, padding: "24px 0", touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragRef.current = null; }}
    >
      <div
        style={{
          position: "relative",
          height: 380,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children.map((child, i) => {
          const offset = i - active;
          const abs = Math.abs(offset);

          if (abs > VISIBLE) return null;

          const isCenter = offset === 0;
          const scale = isCenter ? 1 : 0.78 - (abs - 1) * 0.06;
          const rotateY = isCenter ? 0 : offset < 0 ? 10 : -10;
          const tx = offset * SIDE_OFFSET;
          const z = 20 - abs;
          const opacity = isCenter ? 1 : Math.max(0.75, 0.85 - (abs - 1) * 0.1);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: CARD_W,
                height: CARD_H,
                left: "50%",
                top: "50%",
                marginLeft: -(CARD_W / 2),
                marginTop: -(CARD_H / 2),
                transform: `translateX(${tx}px) scale(${scale}) perspective(800px) rotateY(${rotateY}deg)`,
                zIndex: z,
                opacity,
                transition: "all 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: isCenter ? "default" : "pointer",
                transformOrigin: offset < 0 ? "right center" : offset > 0 ? "left center" : "center center",
              }}
              onClick={() => !isCenter && setActive(i)}
            >
              <div
                className="w-full h-full rounded-xl border border-border bg-card overflow-hidden flex flex-col"
                style={{
                  boxShadow: isCenter
                    ? "0 12px 40px -8px hsl(var(--primary) / 0.22), 0 4px 12px -2px hsl(var(--foreground) / 0.08)"
                    : "0 2px 12px -4px hsl(var(--foreground) / 0.1)",
                  transition: "box-shadow 0.45s ease",
                  pointerEvents: isCenter ? "auto" : "none",
                }}
              >
                {isValidElement(child)
                  ? cloneElement(child as ReactElement<any>, {
                      isActive: isCenter,
                      onGoPrev: active > 0 ? () => go(-1) : undefined,
                      onGoNext: active < count - 1 ? () => go(1) : undefined,
                      isMobile,
                    })
                  : child}
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 pb-4">
          {children.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active
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
