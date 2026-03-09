import { ReactNode, isValidElement, cloneElement, ReactElement, useState } from "react";
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

interface Props {
  children: ReactNode[];
}

export default function CoverflowCarousel({ children }: Props) {
  const count = children.length;
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(Math.floor(count / 2));

  if (count === 0) return null;

  return (
    <div className="relative coverflow-carousel" style={{ padding: "12px 0 8px" }}>
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
        onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.activeIndex)}
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
      `}</style>
    </div>
  );
}