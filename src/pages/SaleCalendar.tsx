import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { getSaleStatus, saleStatusConfig } from "@/data/salesUtils";
import type { Sale, Platform } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import { useSales } from "@/hooks/useSales";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarSkeleton } from "@/components/skeletons/SaleCardSkeleton";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";
import { Switch } from "@/components/ui/switch";
import { countdownText } from "@/utils/countdown";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import ExpandedSaleOverlay from "@/components/ExpandedSaleOverlay";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* ── Platform → HSL color string (matches index.css tokens) ── */
const PLATFORM_COLORS: Record<Platform, string> = {
  무신사: "#444444",
  SSG: "#C94070",
  WCONCEPT: "#7B5EA7",
  쿠팡: "#D4645A",
  올리브영: "#4BA87D",
  KREAM: "#E06840",
  오늘의집: "#2AACB8",
  "29CM": "#8B7355",
  "커뮤니티 핫딜": "#D4A020",
};

const PLATFORM_BG: Record<Platform, string> = {
  무신사: "#44444418",
  SSG: "#C9407018",
  WCONCEPT: "#7B5EA718",
  쿠팡: "#D4645A18",
  올리브영: "#4BA87D18",
  KREAM: "#E0684018",
  오늘의집: "#2AACB818",
  "29CM": "#8B735518",
  "커뮤니티 핫딜": "#D4A02018",
};

const MAX_PILLS_DESKTOP = 2;
const MAX_DOTS_MOBILE = 3;

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** Group sales by platform, return sorted by count desc */
function groupByPlatform(sales: Sale[]): { platform: Platform; count: number }[] {
  const map = new Map<Platform, number>();
  for (const s of sales) map.set(s.platform, (map.get(s.platform) || 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([platform, count]) => ({ platform, count }));
}

export default function SaleCalendar() {
  const [expandedSale, setExpandedSale] = useState<Sale | null>(null);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showCommunity, setShowCommunity] = useState(false);
  const { data: sales = [], isLoading } = useSales();
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarHeight, setCalendarHeight] = useState(500);

  useEffect(() => {
    if (!calendarRef.current || isMobile) return;
    const ro = new ResizeObserver(([entry]) => {
      setCalendarHeight(entry.contentRect.height);
    });
    ro.observe(calendarRef.current);
    return () => ro.disconnect();
  }, [isMobile]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const isCurrentMonth =
    month === new Date().getMonth() && year === new Date().getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const filteredSales = useMemo(() => {
    if (showCommunity) return sales;
    return sales.filter((s) => s.platform !== "커뮤니티 핫딜");
  }, [sales, showCommunity]);

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  /** Pre-compute sales per day for the entire month */
  const salesByDay = useMemo(() => {
    const result: Record<number, Sale[]> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result[d] = filteredSales.filter((s) => s.start_date <= dateStr && s.end_date >= dateStr);
    }
    return result;
  }, [filteredSales, year, month, daysInMonth]);

  const selectedSales = selectedDay ? (salesByDay[selectedDay] ?? []) : [];

  const prev = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  const next = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  if (isLoading && !sales.length) {
    return <CalendarSkeleton />;
  }

  /* ── Sales list panel (shared between desktop sidebar & mobile bottom) ── */
  const salesListContent = (
    <>
      <div className="sticky top-0 z-10 bg-card px-3 py-2 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">
          {selectedDay ? (
            <>
              {month + 1}월 {selectedDay}일 세일{" "}
              {selectedSales.length > 0 && (
                <span className="text-primary ml-1">{selectedSales.length}건</span>
              )}
            </>
          ) : (
            "날짜를 선택하세요"
          )}
        </h3>
      </div>
      <div className="p-3">
        {!selectedDay ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            캘린더에서 날짜를 선택하면 세일 목록이 표시됩니다.
          </div>
        ) : selectedSales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            이 날짜에 진행 중인 세일이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedSales.map((s) => (
              <SaleItem key={s.id} sale={s} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="mx-auto px-3 sm:px-4 pt-4 pb-28 overflow-x-hidden">
      <PageMeta
        title={`${year}년 ${month + 1}월 세일 캘린더 | PickSale`}
        description={`${year}년 ${month + 1}월 쇼핑몰 세일 일정을 캘린더로 확인하세요.`}
      />
      <CanonicalLink href={window.location.origin + "/calendar"} />

      {/* Desktop: 2-column / Mobile: stacked */}
      <div className={isMobile ? "" : "flex gap-4 items-start"}>
        {/* Calendar Card */}
        <div ref={calendarRef} className={`rounded-2xl border border-border bg-card shadow-sm overflow-hidden ${isMobile ? "" : "flex-[6] min-w-0"}`}>
          {/* Month Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              {year}년 {month + 1}월
            </h2>
            <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8 rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day-of-week Header */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-[11px] font-medium py-1.5 ${
                  i === 0 ? "text-destructive/70" : i === 6 ? "text-primary/70" : "text-muted-foreground"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="border-b border-r border-border/30"
                    style={{ minHeight: isMobile ? 52 : 93 }}
                  />
                );
              }

              const daySales = salesByDay[day] ?? [];
              const isToday = isCurrentMonth && day === new Date().getDate();
              const isSelected = day === selectedDay;
              const dayOfWeek = (firstDay + day - 1) % 7;
              const groups = groupByPlatform(daySales);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`flex flex-col text-left border-b border-r border-border/30 transition-colors relative ${
                    isSelected
                      ? ""
                      : isToday
                      ? "bg-primary/[0.04]"
                      : "hover:bg-accent/30"
                  }`}
                  style={{
                    minHeight: isMobile ? 52 : 93,
                    backgroundColor: isSelected ? "#eff6ff" : undefined,
                  }}
                >
                  {/* Day Number */}
                  <div className="px-1 pt-1 pb-0.5 flex justify-start">
                    <span
                      className={`text-[13px] inline-flex items-center justify-center leading-none ${
                        isToday
                          ? "bg-primary text-primary-foreground w-[24px] h-[24px] rounded-full font-bold"
                          : dayOfWeek === 0
                          ? "text-destructive/70 font-medium"
                          : dayOfWeek === 6
                          ? "text-primary/70 font-medium"
                          : "text-foreground font-medium"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Desktop: Platform Pills / Mobile: Color Dots */}
                  {isMobile ? (
                    <MobileDots groups={groups} />
                  ) : (
                    <DesktopPills groups={groups} />
                  )}

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0.5 right-0.5 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend + Community Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-y-2 px-4 py-2.5 border-t border-border bg-accent/20">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {Object.entries(PLATFORM_COLORS)
                .filter(([name]) => name !== "커뮤니티 핫딜")
                .map(([name, color]) => (
                  <span key={name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: color }} />
                    {name}
                  </span>
                ))}
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
              <span className="text-[10px] text-muted-foreground">커뮤니티 핫딜</span>
              <Switch
                checked={showCommunity}
                onCheckedChange={setShowCommunity}
                className="h-4 w-7 data-[state=checked]:bg-sale-community"
              />
            </label>
          </div>
        </div>

        {/* Desktop: Side panel (always visible) */}
        {!isMobile && (
          <div
            className="flex-[4] min-w-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            style={{ height: calendarHeight }}
          >
            <div className="h-full overflow-y-auto">
              {salesListContent}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Bottom list */}
      {isMobile && selectedDay && (
        <div
          className="mt-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in"
          style={{ height: 300 }}
        >
          <div className="h-full overflow-y-auto">
            {salesListContent}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Desktop: Platform name pills ── */
function DesktopPills({ groups }: { groups: { platform: Platform; count: number }[] }) {
  const visible = groups.slice(0, MAX_PILLS_DESKTOP);
  const overflow = groups.length - MAX_PILLS_DESKTOP;

  return (
    <div className="flex flex-col gap-[2px] px-1 pb-1 flex-1">
      {visible.map(({ platform }) => (
        <span
          key={platform}
          className="truncate"
          style={{
            display: "inline-block",
            width: "fit-content",
            backgroundColor: PLATFORM_BG[platform],
            color: PLATFORM_COLORS[platform],
            borderRadius: 4,
            fontSize: 9,
            fontWeight: 600,
            padding: "2px 6px",
            marginBottom: 2,
            lineHeight: "12px",
          }}
        >
          {platform}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[8px] text-muted-foreground font-medium px-0.5 leading-[10px]">
          +{overflow}개
        </span>
      )}
    </div>
  );
}

/* ── Mobile: Color dots ── */
function MobileDots({ groups }: { groups: { platform: Platform; count: number }[] }) {
  const visible = groups.slice(0, MAX_DOTS_MOBILE);
  const overflow = groups.length - MAX_DOTS_MOBILE;

  return (
    <div className="flex items-center gap-[3px] px-1 pb-1 flex-1 flex-wrap">
      {visible.map(({ platform }) => (
        <span
          key={platform}
          className="rounded-full shrink-0"
          style={{
            width: 7,
            height: 7,
            backgroundColor: PLATFORM_COLORS[platform],
          }}
        />
      ))}
      {overflow > 0 && (
        <span className="text-[8px] text-muted-foreground font-medium leading-[10px]">
          +{overflow}
        </span>
      )}
    </div>
  );
}

/* ── Sale list item with D-day ── */
function SaleItem({ sale, navigate }: { sale: Sale; navigate: (path: string) => void }) {
  const status = getSaleStatus(sale);
  const statusConf = saleStatusConfig[status];
  const isEndingToday = status === "ending_today";
  const dday = countdownText(sale.end_date);

  return (
    <div
      onClick={() => navigate(`/sale/${sale.id}`)}
      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border cursor-pointer hover:shadow-card-hover transition-shadow"
    >
      {/* Platform color dot */}
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: PLATFORM_COLORS[sale.platform] }}
      />
      <div className="w-9 h-9 flex items-center justify-center shrink-0">
        <PlatformLogo platform={sale.platform} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{sale.sale_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground">
            {shortDate(sale.start_date)} ~ {shortDate(sale.end_date)}
          </span>
          {isEndingToday ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today" style={{ fontSize: "10px", fontWeight: 700, padding: "1px 5px" }}>
              <span className="w-1 h-1 rounded-full bg-closing-today animate-closing-pulse" />
              오늘 마감
            </span>
          ) : (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${statusConf.className}`}>
              {dday}
            </span>
          )}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  );
}
