import { useEffect, useCallback } from "react";
import { Sale, getSaleStatus, saleStatusConfig, platformColors } from "@/data/salesUtils";
import { platformLogos } from "@/data/platformLogos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Bell, X } from "lucide-react";
import { toast } from "sonner";
import { countdownText, isUrgentCountdown } from "@/utils/countdown";
import SaleBannerImage from "@/components/SaleBannerImage";

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

interface Props {
  sale: Sale | null;
  onClose: () => void;
}

export default function ExpandedSaleOverlay({ sale, onClose }: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!sale) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [sale, handleKeyDown]);

  if (!sale) return null;

  const status = getSaleStatus(sale);
  const statusInfo = saleStatusConfig[status];
  const countdown = countdownText(sale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  const logoSrc = platformLogos[sale.platform];
  const colorClass = platformColors[sale.platform];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ animation: "expandOverlayIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards" }}
    >
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "expandDimIn 300ms ease forwards" }}
      />

      {/* Expanded card */}
      <div
        className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          animation: "expandCardIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          willChange: "transform, opacity",
          boxShadow: "0 25px 60px -12px hsl(var(--foreground) / 0.25), 0 8px 24px -4px hsl(var(--primary) / 0.15)",
        }}
      >
        {/* Platform header */}
        <div className={`${colorClass} px-5 pt-5 pb-8 relative shrink-0`}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/15 backdrop-blur-sm rounded-xl p-2 text-primary-foreground hover:bg-white/25 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-center pt-2">
            <div className="w-14 h-14 rounded-xl bg-white/90 shadow-sm flex items-center justify-center p-2">
              <img src={logoSrc} alt={sale.platform} className="w-full h-full object-contain" />
            </div>
            <p className="text-primary-foreground/80 text-xs font-bold tracking-wide mt-2 uppercase">
              {sale.platform}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {status === "ending_today" ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-closing-today-bg text-closing-today text-xs font-bold px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-closing-today animate-closing-pulse" />
                  오늘 마감
                </span>
              ) : (
                <Badge variant="outline" className={`${statusInfo.className} border-0 text-xs font-semibold`}>
                  {statusInfo.emoji} {statusInfo.label}
                </Badge>
              )}
              <span className={`text-xs ${isUrgent ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                {countdown}
              </span>
            </div>
            <h2 className="text-lg font-bold text-card-foreground leading-snug tracking-tight">
              {sale.sale_name}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{formatDate(sale.start_date)} ~ {formatDate(sale.end_date)}</span>
          </div>

          {sale.category.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sale.category.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-[11px] font-semibold rounded-full px-3 py-0.5 bg-secondary/80">
                  {cat}
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
              onClick={() => toast.success("알림이 설정되었습니다! 🔔")}
            >
              <Bell className="w-4 h-4" />
              알림받기
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes expandDimIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes expandOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes expandCardIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
