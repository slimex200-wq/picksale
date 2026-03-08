import { useState, useMemo } from "react";
import { platformColors, platformEmojis, getSaleStatus, saleStatusConfig } from "@/data/salesUtils";
import type { Sale, Platform } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { useSales } from "@/hooks/useSales";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** Map platform to its Tailwind dot color class (bg-sale-xxx) */
const platformDotColors: Record<Platform, string> = {
  "쿠팡": "bg-sale-coupang",
  "올리브영": "bg-sale-oliveyoung",
  "무신사": "bg-sale-musinsa",
  "KREAM": "bg-sale-kream",
  "SSG": "bg-sale-ssg",
  "오늘의집": "bg-sale-ohouse",
  "29CM": "bg-sale-29cm",
  "커뮤니티 핫딜": "bg-sale-community",
};

export default function SaleCalendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const { data: sales = [], isLoading } = useSales();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const isCurrentMonth =
    month === new Date().getMonth() && year === new Date().getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  const getSalesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return sales.filter((s) => s.start_date <= dateStr && s.end_date >= dateStr);
  };

  const selectedSales = selectedDay ? getSalesForDay(selectedDay) : [];

  const prev = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  const next = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-5">
        <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-bold text-foreground">
          {year}년 {month + 1}월
        </h2>
        <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-semibold py-1 ${
              i === 0 ? "text-destructive/70" : i === 6 ? "text-blue-500/70" : "text-muted-foreground"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const daySales = getSalesForDay(day);
          const isToday = isCurrentMonth && day === new Date().getDate();
          const isSelected = day === selectedDay;
          const dayOfWeek = (firstDay + day - 1) % 7;

          // Unique platforms for dots (max 4)
          const uniquePlatforms = [...new Set(daySales.map((s) => s.platform))].slice(0, 4);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day === selectedDay ? null : day)}
              className={`flex flex-col items-center py-2 rounded-lg transition-all relative border border-border/25 ${
                isSelected
                  ? "bg-primary/15 ring-1 ring-primary/40 border-primary/30"
                  : "hover:bg-muted/60 hover:border-border/40"
              }`}
            >
              <span
                className={`text-sm font-medium leading-none ${
                  isToday
                    ? "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center font-bold"
                    : dayOfWeek === 0
                    ? "text-destructive/80"
                    : dayOfWeek === 6
                    ? "text-blue-500/80"
                    : "text-foreground"
                }`}
              >
                {day}
              </span>

              {/* Dot indicators */}
              {uniquePlatforms.length > 0 && (
                <div className="flex gap-0.5 mt-1.5">
                  {uniquePlatforms.map((p) => (
                    <span
                      key={p}
                      className={`w-1.5 h-1.5 rounded-full ${platformDotColors[p]}`}
                    />
                  ))}
                </div>
              )}

              {/* Sale count badge */}
              {daySales.length > 0 && (
                <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                  {daySales.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDay && (
        <div className="mt-6 animate-fade-in">
          <h3 className="text-sm font-bold text-foreground mb-3">
            {month + 1}월 {selectedDay}일 세일 {selectedSales.length > 0 ? `(${selectedSales.length}건)` : ""}
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

  return (
    <div
      onClick={() => navigate(`/sale/${sale.id}`)}
      className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border cursor-pointer hover:shadow-card-hover transition-shadow"
    >
      <img
        src={platformLogos[sale.platform]}
        alt={sale.platform}
        className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{sale.sale_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground">
            {sale.start_date} ~ {sale.end_date}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${statusConf.className}`}>
            {statusConf.emoji} {statusConf.label}
          </span>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}
