import { Sale, getSaleStatus, saleStatusConfig, platformColors, platformEmojis } from "@/data/salesUtils";
import { formatCategory } from "@/utils/categoryFormat";
import PlatformLogo from "@/components/PlatformLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ExternalLink, Calendar, Bell, X, Lock } from "lucide-react";
import { toast } from "sonner";
import { countdownText, isUrgentCountdown } from "@/utils/countdown";
import ClosingTodayBadge from "@/components/ClosingTodayBadge";
import { useLoginGate } from "@/hooks/useLoginGate";
import { useAuth } from "@/hooks/useAuth";

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

interface Props {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SaleDetailSheet({ sale, open, onOpenChange }: Props) {
  const { requireLogin } = useLoginGate();
  const { user } = useAuth();
  if (!sale) return null;

  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const countdown = countdownText(sale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  
  const colorClass = platformColors[sale.platform];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto p-0 border-t border-border/50"
      >
        {/* Platform header */}
        <div className={`${colorClass} px-5 pt-5 pb-8 relative`}>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm rounded-xl p-2 text-primary-foreground hover:bg-white/25 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center pt-2">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <PlatformLogo platform={sale.platform} className="w-full h-full object-contain" />
            </div>
            <p className="text-primary-foreground/80 text-xs font-bold tracking-wide mt-2 uppercase">
              {sale.platform}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <SheetHeader className="p-0 text-left space-y-2">
            <div className="flex items-center gap-2">
              {status === "ending_today" ? (
                <ClosingTodayBadge endDate={sale.end_date} size="md" />
              ) : (
                <Badge variant="outline" className={`${statusInfo.className} border-0 text-xs font-semibold`}>
                  {statusInfo.emoji} {statusInfo.label}
                </Badge>
              )}
              {status !== "ending_today" && (
                <span className={`text-xs font-display ${isUrgent ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                  {countdown}
                </span>
              )}
            </div>
            <SheetTitle className="text-lg font-bold text-card-foreground leading-snug tracking-tight">
              {sale.sale_name}
            </SheetTitle>
            <SheetDescription className="sr-only">{sale.platform} 세일 상세 정보</SheetDescription>
          </SheetHeader>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{formatDate(sale.start_date)} ~ {formatDate(sale.end_date)}</span>
          </div>

          {sale.category.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sale.category.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[11px] font-semibold rounded-full px-3 py-0.5 bg-secondary/80">
                  {formatCategory(cat)}
                </Badge>
              ))}
            </div>
          )}

          {sale.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {sale.description}
            </p>
          )}

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              className="w-full rounded-xl gap-2 h-11 font-semibold"
              onClick={() => window.open(sale.link, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              세일 바로가기
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2 h-11 font-semibold border-border/70"
              onClick={() => requireLogin(() => toast.success("알림이 설정되었습니다! 🔔"), "alert")}
            >
              {!user && <Lock className="w-3 h-3 opacity-50" />}
              <Bell className="w-4 h-4" />
              알림받기
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
