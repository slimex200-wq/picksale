import { useState, useMemo } from "react";
import { platformColors } from "@/data/salesUtils";
import { useSales } from "@/hooks/useSales";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function SaleCalendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: sales = [], isLoading } = useSales();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

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

  const prev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const next = () => setCurrentMonth(new Date(year, month + 1, 1));

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={prev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-base font-bold text-foreground">
          {year}년 {month + 1}월
        </h2>
        <Button variant="ghost" size="sm" onClick={next}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const daySales = getSalesForDay(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={day}
              className={`min-h-[80px] rounded-md p-2 text-xs transition-colors border ${
                isToday ? "bg-primary/15 border-primary/40" : "bg-card border-border"
              }`}
            >
              <span
                className={`block text-center font-semibold mb-1 text-sm ${
                  isToday ? "text-primary font-bold" : "text-foreground"
                }`}
              >
                {day}
              </span>
              <div className="space-y-1">
                {daySales.slice(0, 2).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/sale/${s.id}`)}
                    className={`${platformColors[s.platform]} text-primary-foreground text-[9px] px-1.5 py-1 rounded-sm truncate cursor-pointer font-semibold shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {s.sale_name}
                  </div>
                ))}
                {daySales.length > 2 && (
                  <span className="text-[9px] text-foreground font-medium block text-center">
                    +{daySales.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
