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
  const containerRef = useRef<HTMLDivElement>(null);
  const nudgeRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const hintEligible = useRef(false);
  const hintPlayed = useRef(false);
  const userInteracted = useRef(false);

  const triggerHint = useCallback(() => {
    if (hintPlayed.current || !hintEligible.current) return;
    hintPlayed.current = true;
    hintEligible.current = false;
    sessionStorage.setItem(HINT_SESSION_KEY, "1");
    setShowHint(true);
  }, []);

  const dismissHint = useCallback((reason: string) => {
    userInteracted.current = true;
    hintEligible.current = false;
    hintPlayed.current = true;
    sessionStorage.setItem(HINT_SESSION_KEY, "1");
    setShowHint(false);
  }, []);

  useEffect(() => {
    if (count < 2) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sessionValue = sessionStorage.getItem(HINT_SESSION_KEY);
    if (prefersReduced || sessionValue) return;
    hintEligible.current = true;
  }, [count]);

  useEffect(() => {
    if (isMobile || count < 2) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sessionValue = sessionStorage.getItem(HINT_SESSION_KEY);
    if (prefersReduced || sessionValue) return;

    const container = containerRef.current;
    if (!container) return;

    // Only attach to visible slide elements — not the container background
    const slides = container.querySelectorAll(".swiper-slide");
    const handler = () => triggerHint();

    slides.forEach((slide) => slide.addEventListener("mouseenter", handler));

    return () => {
      slides.forEach((slide) => slide.removeEventListener("mouseenter", handler));
    };
  }, [activeIndex, count, isMobile, triggerHint]);

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

  // Clean up after animation ends — no debug logging needed


  if (count === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative coverflow-carousel"
      style={{ padding: "12px 0 8px" }}
      onPointerDown={() => dismissHint("pointerdown")}
      onWheel={() => dismissHint("wheel")}
      onKeyDown={() => dismissHint("keyboard")}
      tabIndex={0}
    >
      <div
        ref={nudgeRef}
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
          onSwiper={(swiper: SwiperType) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper: SwiperType) => {
            setActiveIndex(swiper.activeIndex);
            if (userInteracted.current) {
              dismissHint("slide-change");
            }
          }}
          onTouchStart={() => dismissHint("touchstart")}
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

        @keyframes coverflow-nudge {
          0%   { transform: translateX(0); }
          25%  { transform: translateX(-20px); }
          55%  { transform: translateX(14px); }
          80%  { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .coverflow-nudge-track {
          animation: coverflow-nudge 1000ms ease-in-out 1 forwards;
          will-change: transform;
        }

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
