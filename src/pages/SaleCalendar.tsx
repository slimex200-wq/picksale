import { useState, useMemo } from "react";
import { mockSales, platformColors } from "@/data/mockSales";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function SaleCalendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    return mockSales.filter((s) => s.start_date <= dateStr && s.end_date >= dateStr);
  };

  const prev = () => setCurrentMonth(new Date(year, month - 1, 1));
  const next = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      {/* Month nav */}
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

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const sales = getSalesForDay(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={day}
              className={`min-h-[60px] rounded-md p-1 text-xs transition-colors ${
                isToday ? "bg-primary/10 border border-primary/30" : "bg-card"
              }`}
            >
              <span
                className={`block text-center font-medium mb-0.5 ${
                  isToday ? "text-primary font-bold" : "text-foreground"
                }`}
              >
                {day}
              </span>
              <div className="space-y-0.5">
                {sales.slice(0, 2).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/sale/${s.id}`)}
                    className={`${platformColors[s.platform]} text-primary-foreground text-[8px] px-1 py-0.5 rounded-sm truncate cursor-pointer font-medium`}
                  >
                    {s.sale_name}
                  </div>
                ))}
                {sales.length > 2 && (
                  <span className="text-[8px] text-muted-foreground block text-center">
                    +{sales.length - 2}
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
