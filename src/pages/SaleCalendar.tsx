// @ts-nocheck
import { useState, useMemo, useCallback } from "react";
import { getSaleStatus, saleStatusConfig } from "@/data/salesUtils";
import type { Sale, Platform } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import { useSales } from "@/hooks/useSales";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarSkeleton } from "@/components/skeletons/SaleCardSkeleton";
import { useNavigate } from "react-router-dom";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";
import { Switch } from "@/components/ui/switch";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* ── Platform → HSL color string (matches index.css tokens) ── */
const PLATFORM_BAR_COLORS: Record<Platform, string> = {
  쿠팡: "hsl(4, 60%, 59%)",
  올리브영: "hsl(153, 38%, 48%)",
  무신사: "hsl(0, 0%, 27%)",
  KREAM: "hsl(15, 73%, 56%)",
  SSG: "hsl(340, 55%, 52%)",
  오늘의집: "hsl(185, 63%, 44%)",
  "29CM": "hsl(31, 24%, 44%)",
  WCONCEPT: "hsl(264, 28%, 51%)",
  "커뮤니티 핫딜": "hsl(35, 90%, 55%)",
};

/* Light background (20% opacity) version for pill bg */
const PLATFORM_BAR_BG_LIGHT: Record<Platform, string> = {
  쿠팡: "hsla(4, 60%, 59%, 0.15)",
  올리브영: "hsla(153, 38%, 48%, 0.15)",
  무신사: "hsla(0, 0%, 27%, 0.12)",
  KREAM: "hsla(15, 73%, 56%, 0.15)",
  SSG: "hsla(340, 55%, 52%, 0.15)",
  오늘의집: "hsla(185, 63%, 44%, 0.15)",
  "29CM": "hsla(31, 24%, 44%, 0.12)",
  WCONCEPT: "hsla(264, 28%, 51%, 0.15)",
  "커뮤니티 핫딜": "hsla(35, 90%, 55%, 0.15)",
};

const MAX_PILLS = 3;

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
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showCommunity, setShowCommunity] = useState(false);
  const { data: sales = [], isLoading } = useSales();

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

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 pb-28 overflow-x-hidden">
      <PageMeta
        title={`${year}년 ${month + 1}월 세일 캘린더 | PickSale`}
        description={`${year}년 ${month + 1}월 쇼핑몰 세일 일정을 캘린더로 확인하세요.`}
      />
      <CanonicalLink href={window.location.origin + "/calendar"} />

      {/* Calendar Card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
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
                  style={{ minHeight: 62 }}
                />
              );
            }

            const daySales = salesByDay[day] ?? [];
            const isToday = isCurrentMonth && day === new Date().getDate();
            const isSelected = day === selectedDay;
            const dayOfWeek = (firstDay + day - 1) % 7;
            const groups = groupByPlatform(daySales);
            const visibleGroups = groups.slice(0, MAX_PILLS);
            const overflowCount = groups.length - MAX_PILLS;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`flex flex-col text-left border-b border-r border-border/30 transition-colors relative ${
                  isToday
                    ? "bg-primary/[0.04]"
                    : isSelected
                    ? "bg-accent/50"
                    : "hover:bg-accent/30"
                }`}
                style={{ minHeight: 62 }}
              >
                {/* Day Number */}
                <div className="px-1 pt-1 pb-0.5 flex justify-start">
                  <span
                    className={`text-[11px] inline-flex items-center justify-center leading-none ${
                      isToday
                        ? "bg-primary text-primary-foreground w-[22px] h-[22px] rounded-full font-bold"
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

                {/* Pill-style bars — light bg + colored text, platform name only */}
                <div className="flex flex-col gap-[1px] px-0.5 pb-1 flex-1">
                  {visibleGroups.map(({ platform }) => (
                    <div
                      key={platform}
                      className="rounded-[2px] truncate px-1"
                      style={{
                        height: 10,
                        lineHeight: "10px",
                        backgroundColor: PLATFORM_BAR_BG_LIGHT[platform],
                      }}
                    >
                      <span
                        className="text-[8px] font-semibold truncate block"
                        style={{ color: PLATFORM_BAR_COLORS[platform] }}
                      >
                        {platform}
                      </span>
                    </div>
                  ))}
                  {overflowCount > 0 && (
                    <span className="text-[8px] text-muted-foreground font-normal px-1 leading-[10px]">
                      +{overflowCount}개
                    </span>
                  )}
                </div>

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
            {Object.entries(PLATFORM_BAR_COLORS)
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

      {/* Selected Day Sales List */}
      {selectedDay && (
        <div className="mt-5 animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-3 px-1">
            {month + 1}월 {selectedDay}일 세일{" "}
            {selectedSales.length > 0 && (
              <span className="text-primary ml-1">{selectedSales.length}건</span>
            )}
          </h3>
          {selectedSales.length === 0 ? (
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
      )}
    </div>
  );
}

function SaleItem({ sale, navigate }: { sale: Sale; navigate: (path: string) => void }) {
  const status = getSaleStatus(sale);
  const statusConf = saleStatusConfig[status];
  const isEndingToday = status === "ending_today";

  return (
    <div
      onClick={() => navigate(`/sale/${sale.id}`)}
      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border cursor-pointer hover:shadow-card-hover transition-shadow"
    >
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: PLATFORM_BAR_COLORS[sale.platform] }}
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
              {statusConf.emoji} {statusConf.label}
            </span>
          )}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  );
}
