import { useParams, useNavigate } from "react-router-dom";
import { mockSales, platformColors, platformEmojis } from "@/data/mockSales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Bell, Calendar } from "lucide-react";
import { toast } from "sonner";

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sale = mockSales.find((s) => s.id === id);

  if (!sale) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-muted-foreground">세일을 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          홈으로
        </Button>
      </div>
    );
  }

  const colorClass = platformColors[sale.platform];

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className={`${colorClass} px-4 py-6 relative`}>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-card/20 backdrop-blur-sm rounded-md p-1.5 text-primary-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center pt-4">
          <span className="text-4xl">{platformEmojis[sale.platform]}</span>
          <p className="text-primary-foreground/80 text-sm font-medium mt-2">
            {sale.platform}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-lg shadow-card p-5 space-y-4">
          <h2 className="text-xl font-bold text-card-foreground">
            {sale.sale_name}
          </h2>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {formatDate(sale.start_date)} ~ {formatDate(sale.end_date)}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {sale.category.map((cat) => (
              <Badge key={cat} variant="secondary" className="rounded-md">
                {cat}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {sale.description}
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full rounded-md gap-2"
              onClick={() => window.open(sale.link, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              세일 바로가기
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-md gap-2"
              onClick={() => toast.success("알림이 설정되었습니다! 🔔")}
            >
              <Bell className="w-4 h-4" />
              알림받기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
