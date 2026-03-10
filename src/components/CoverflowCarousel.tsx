import { ReactNode, isValidElement, cloneElement, ReactElement, useState, useRef, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-coverflow";
// @ts-ignore
import "swiper/css/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

const HINT_SESSION_KEY = "coverflow-hint-shown";

interface Props {
  children: ReactNode[];
}

export default function CoverflowCarousel({ children }: Props) {
  const count = children.length;
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(Math.floor(count / 2));
  const [showHint, setShowHint] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const hintEligible = useRef(false);
  const hintPlayed = useRef(false);
  const userInteracted = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check eligibility on mount
  useEffect(() => {
    if (count < 2) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    if (sessionStorage.getItem(HINT_SESSION_KEY)) return;
    hintEligible.current = true;
  }, [count]);

  // Mobile: IntersectionObserver trigger
  useEffect(() => {
    if (!isMobile || count < 2) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    if (sessionStorage.getItem(HINT_SESSION_KEY)) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hintEligible.current && !hintPlayed.current) {
          triggerHint();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, count]);

  const triggerHint = useCallback(() => {
    if (hintPlayed.current || !hintEligible.current) return;
    hintPlayed.current = true;
    hintEligible.current = false;
    sessionStorage.setItem(HINT_SESSION_KEY, "1");
    setShowHint(true);
  }, []);

  const dismissHint = useCallback(() => {
    userInteracted.current = true;
    hintEligible.current = false;
    hintPlayed.current = true;
    sessionStorage.setItem(HINT_SESSION_KEY, "1");
    setShowHint(false);
  }, []);

  // Desktop: trigger on first hover
  const handleMouseEnter = useCallback(() => {
    if (!isMobile && hintEligible.current && !hintPlayed.current) {
      triggerHint();
    }
  }, [isMobile, triggerHint]);

  if (count === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative coverflow-carousel"
      style={{ padding: "12px 0 8px" }}
      onMouseEnter={handleMouseEnter}
      onPointerDown={dismissHint}
    >
      {/* Nudge wrapper — wraps the entire Swiper so translateX works without conflicting with Swiper's internal transforms */}
      <div
        className={showHint ? "coverflow-nudge-track" : undefined}
        onAnimationEnd={() => setShowHint(false)}
      >
        <Swiper
          modules={[EffectCoverflow, Pagination]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          initialSlide={Math.floor(count / 2)}
          speed={450}
          coverflowEffect={{
            rotate: 35,
            stretch: 0,
            depth: 120,
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{
            clickable: true,
            el: ".coverflow-dots",
            bulletClass: "coverflow-dot",
            bulletActiveClass: "coverflow-dot-active",
          }}
          onSwiper={(swiper: SwiperType) => { swiperRef.current = swiper; }}
          onSlideChange={(swiper: SwiperType) => {
            setActiveIndex(swiper.activeIndex);
            // Only dismiss if user actually interacted (not initial mount)
            if (userInteracted.current) {
              dismissHint();
            }
          }}
          onTouchStart={() => {
            userInteracted.current = true;
            dismissHint();
          }}
          onTouchMove={() => {
            userInteracted.current = true;
          }}
          style={{ overflow: "visible", paddingBottom: 8 }}
        >
          {children.map((child, i) => {
            const isCenter = i === activeIndex;
            return (
              <SwiperSlide
                key={i}
                style={{
                  width: 280,
                  height: 360,
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                  opacity: isCenter ? 1 : 0.55,
                }}
              >
                <div
                  className="w-full h-full rounded-xl border border-border bg-card overflow-hidden flex flex-col"
                  style={{
                    boxShadow: isCenter
                      ? "0 12px 40px -8px hsl(var(--primary) / 0.22), 0 4px 12px -2px hsl(var(--foreground) / 0.08)"
                      : "0 2px 12px -4px hsl(var(--foreground) / 0.1)",
                    transition: "box-shadow 0.45s ease",
                  }}
                >
                  {isValidElement(child)
                    ? cloneElement(child as ReactElement<any>, {
                        isActive: isCenter,
                        isMobile,
                      })
                    : child}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Custom dot indicators */}
      <div className="coverflow-dots flex justify-center gap-1.5 mt-3 pb-2" />

      <style>{`
        .coverflow-carousel .swiper {
          overflow: visible !important;
        }
        .coverflow-carousel .swiper-wrapper {
          align-items: center;
        }
        .coverflow-carousel .swiper-slide {
          transition: opacity 0.35s ease !important;
        }
        .coverflow-dot {
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: hsl(var(--muted-foreground) / 0.25);
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
        }
        .coverflow-dot:hover {
          background: hsl(var(--muted-foreground) / 0.4);
        }
        .coverflow-dot-active {
          width: 20px;
          height: 6px;
          background: hsl(var(--primary)) !important;
        }

        /* One-time nudge — applied to outer wrapper, not swiper-wrapper */
        @keyframes coverflow-nudge {
          0%   { transform: translateX(0); }
          25%  { transform: translateX(-12px); }
          55%  { transform: translateX(8px); }
          80%  { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
        .coverflow-nudge-track {
          animation: coverflow-nudge 800ms ease-in-out 1 forwards;
        }

        /* Edge fade hints */
        .coverflow-carousel::before,
        .coverflow-carousel::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 24px;
          z-index: 5;
          pointer-events: none;
        }
        .coverflow-carousel::before {
          left: 0;
          background: linear-gradient(to right, hsl(var(--background)), transparent);
        }
        .coverflow-carousel::after {
          right: 0;
          background: linear-gradient(to left, hsl(var(--background)), transparent);
        }
      `}</style>
    </div>
  );
}
