import { Sale, platformColors, platformEmojis } from "@/data/salesUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function daysLeft(endDate: string) {
  const diff = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / 86400000
  );
  if (diff <= 0) return "오늘 종료";
  if (diff === 1) return "내일 종료";
  return `${diff}일 남음`;
}

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function SaleCard({ sale }: { sale: Sale }) {
  const navigate = useNavigate();
  const colorClass = platformColors[sale.platform];

  return (
    <div
      className="w-full bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer flex flex-col overflow-hidden animate-fade-in"
      onClick={() => navigate(`/sale/${sale.id}`)}
    >
      <div className={`${colorClass} px-4 py-3 flex items-center gap-2`}>
        <span className="text-xl">{platformEmojis[sale.platform]}</span>
        <span className="text-primary-foreground font-semibold text-xs whitespace-nowrap">
          {sale.platform}
        </span>
        <span className="ml-auto text-primary-foreground/80 text-xs font-medium">
          {daysLeft(sale.end_date)}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-base text-card-foreground leading-tight">
          {sale.sale_name}
        </h3>

        <p className="text-xs text-muted-foreground">
          {formatDate(sale.start_date)} ~ {formatDate(sale.end_date)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {sale.category.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="text-xs font-medium rounded-md"
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 mt-auto pt-2">
          <Button
            size="sm"
            className="flex-1 rounded-md text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sale/${sale.id}`);
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            세일 보기
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-md text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              toast.success("알림이 설정되었습니다! 🔔");
            }}
          >
            <Bell className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
