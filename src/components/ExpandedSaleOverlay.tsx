import { useEffect, useCallback, useState } from "react";
import { formatCategory } from "@/utils/categoryFormat";
import { Sale, getSaleStatus, saleStatusConfig, platformColors } from "@/data/salesUtils";
import PlatformLogo from "@/components/PlatformLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Bell, X, Pencil, Lock } from "lucide-react";
import { toast } from "sonner";
import { countdownText, isUrgentCountdown } from "@/utils/countdown";
import SaleBannerImage from "@/components/SaleBannerImage";
import SaleInlineEditor from "@/components/SaleInlineEditor";
import { useAdmin } from "@/hooks/useAdmin";
import { useLoginGate } from "@/hooks/useLoginGate";
import { useAuth } from "@/hooks/useAuth";

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

interface Props {
  sale: Sale | null;
  onClose: () => void;
  onSaleUpdated?: (updated: Sale) => void;
}

export default function ExpandedSaleOverlay({ sale, onClose, onSaleUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(sale);
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const { requireLogin } = useLoginGate();

  // Sync when sale prop changes
  useEffect(() => {
    setCurrentSale(sale);
    setEditing(false);
  }, [sale]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editing) setEditing(false);
        else onClose();
      }
    },
    [onClose, editing]
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

  if (!currentSale) return null;

  const status = getSaleStatus(currentSale);
  const statusInfo = saleStatusConfig[status];
  const countdown = countdownText(currentSale.end_date);
  const isUrgent = isUrgentCountdown(countdown);
  

  const handleSaved = (updated: Sale) => {
    setCurrentSale(updated);
    setEditing(false);
    onSaleUpdated?.(updated);
  };

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
        {/* Banner / Platform header */}
        <div className="relative shrink-0">
          <SaleBannerImage imageUrl={currentSale.image_url} platform={currentSale.platform} alt={currentSale.sale_name} aspectRatio="16/9" />
          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
            {isAdmin && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-foreground/20 backdrop-blur-sm rounded-xl p-2 text-white hover:bg-foreground/40 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-foreground/20 backdrop-blur-sm rounded-xl p-2 text-white hover:bg-foreground/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <PlatformLogo platform={currentSale.platform} className="w-full h-full object-contain" />
            </div>
            <span className="text-white text-xs font-bold tracking-wide drop-shadow-sm">
              {currentSale.platform}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {editing ? (
            <SaleInlineEditor
              sale={currentSale}
              onSaved={handleSaved}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
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
                  <span className={`text-xs font-display ${isUrgent ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {countdown}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-card-foreground leading-snug tracking-tight">
                  {currentSale.sale_name}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{formatDate(currentSale.start_date)} ~ {formatDate(currentSale.end_date)}</span>
              </div>

              {currentSale.category.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {currentSale.category.map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-[11px] font-semibold rounded-full px-3 py-0.5 bg-secondary/80">
                      {formatCategory(cat)}
                    </Badge>
                  ))}
                </div>
              )}

              {currentSale.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentSale.description}
                </p>
              )}

              <div className="flex flex-col gap-2.5 pt-2">
                <Button
                  className="w-full rounded-xl gap-2 h-11 font-semibold"
                  onClick={() => window.open(currentSale.link, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  세일 바로가기
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 h-11 font-semibold border-border/70"
                  onClick={() => {
                    requireLogin(() => toast.success("알림이 설정되었습니다! 🔔"), "alert");
                  }}
                >
                  {!user && <Lock className="w-3 h-3 opacity-50" />}
                  <Bell className="w-4 h-4" />
                  알림받기
                </Button>
              </div>
            </>
          )}
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
