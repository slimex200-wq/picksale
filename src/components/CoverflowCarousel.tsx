import { ReactNode, isValidElement, cloneElement, ReactElement, useState, useRef, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/effect-coverflow";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HINT_SESSION_KEY = "coverflow-hint-shown";

interface Props {
  children: ReactNode[];
}

export default function CoverflowCarousel({ children }: Props) {
  const count = children.length;
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(Math.floor(count / 2));
  const [showHint, setShowHint] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nudgeRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const hintEligible = useRef(false);
  const hintPlayed = useRef(false);
  const userInteracted = useRef(false);

  useEffect(() => {
    if (count < 2) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sessionValue = sessionStorage.getItem(HINT_SESSION_KEY);
    if (prefersReduced || sessionValue) return;
    hintEligible.current = true;
  }, [count]);

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

  const handleCardMouseEnter = useCallback(() => {
    if (isMobile || count < 2) return;
    triggerHint();
  }, [isMobile, count, triggerHint]);

  useEffect(() => {
    if (!isMobile || count < 2) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sessionValue = sessionStorage.getItem(HINT_SESSION_KEY);
    if (prefersReduced || sessionValue) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3 && hintEligible.current && !hintPlayed.current) {
          triggerHint();
          observer.disconnect();
        }
      },
      { threshold: [0, 0.3, 0.5] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [count, isMobile, triggerHint]);

  const updateNavState = useCallback((swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  if (count === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative coverflow-carousel"
      style={{ padding: "12px 0 8px" }}
      onKeyDown={dismissHint}
      tabIndex={0}
    >
      {/* Desktop nav arrows */}
      {!isMobile && count > 1 && (
        <>
          <button
            aria-label="이전 세일"
            className="coverflow-nav coverflow-nav-prev"
            style={{ opacity: isBeginning ? 0.25 : undefined }}
            disabled={isBeginning}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            aria-label="다음 세일"
            className="coverflow-nav coverflow-nav-next"
            style={{ opacity: isEnd ? 0.25 : undefined }}
            disabled={isEnd}
            onClick={() => swiperRef.current?.slideNext()}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      <div
        ref={nudgeRef}
        className={showHint ? "coverflow-nudge-track" : undefined}
        onAnimationEnd={() => setShowHint(false)}
      >
        <Swiper
          modules={[EffectCoverflow, Pagination, Navigation]}
          effect="coverflow"
          grabCursor={false}
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
          onSwiper={(swiper: SwiperType) => {
            swiperRef.current = swiper;
            updateNavState(swiper);
          }}
          onSlideChange={(swiper: SwiperType) => {
            setActiveIndex(swiper.activeIndex);
            updateNavState(swiper);
            if (userInteracted.current) {
              dismissHint();
            }
          }}
          onTouchStart={dismissHint}
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
                  opacity: isCenter ? 1 : isMobile ? 0.55 : 0.72,
                }}
              >
                <div
                  className="w-full h-full rounded-xl border border-border bg-card overflow-hidden flex flex-col"
                  onMouseEnter={handleCardMouseEnter}
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

        /* Dot indicator */
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

        /* Nudge animation */
        @keyframes coverflow-nudge {
          0%   { transform: translateX(0); }
          20%  { transform: translateX(-18px); }
          50%  { transform: translateX(10px); }
          75%  { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
        .coverflow-nudge-track {
          animation: coverflow-nudge 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 1 forwards;
          will-change: transform;
        }

        /* Edge fade — desktop: wider, mobile: narrow */
        .coverflow-carousel::before,
        .coverflow-carousel::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          z-index: 5;
          pointer-events: none;
        }
        .coverflow-carousel::before {
          left: 0;
          width: 48px;
          background: linear-gradient(to right, hsl(var(--background)), hsl(var(--background) / 0));
        }
        .coverflow-carousel::after {
          right: 0;
          width: 48px;
          background: linear-gradient(to left, hsl(var(--background)), hsl(var(--background) / 0));
        }
        @media (max-width: 767px) {
          .coverflow-carousel::before,
          .coverflow-carousel::after {
            width: 24px;
          }
        }

        /* Desktop nav buttons */
        .coverflow-nav {
          display: none;
        }
        @media (min-width: 768px) {
          .coverflow-nav {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            border: 1px solid hsl(var(--border));
            background: hsl(var(--card));
            color: hsl(var(--muted-foreground));
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
          }
          .coverflow-nav:hover:not(:disabled) {
            opacity: 1;
            color: hsl(var(--foreground));
            box-shadow: 0 2px 8px hsl(var(--foreground) / 0.08);
          }
          .coverflow-nav:disabled {
            cursor: default;
          }
          .coverflow-nav-prev {
            left: 4px;
          }
          .coverflow-nav-next {
            right: 4px;
          }
        }
      `}</style>
    </div>
  );
}
