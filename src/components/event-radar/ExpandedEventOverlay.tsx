import { useEffect, useCallback } from "react";
import { type EventOccurrence } from "@/hooks/useEventOccurrences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, X, Radar } from "lucide-react";

function formatDate(d: string) {
  const [, m, day] = d.split("-");
  return `${parseInt(m)}월 ${parseInt(day)}일`;
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return "";
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (start) return formatDate(start);
  return formatDate(end!);
}

const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
  live: { label: "진행 중", emoji: "🟢", className: "bg-green-100 text-green-800 border-green-400" },
  scheduled: { label: "예정", emoji: "🟡", className: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  ended: { label: "종료", emoji: "⚪", className: "bg-muted text-muted-foreground border-border" },
};

interface Props {
  event: EventOccurrence | null;
  onClose: () => void;
}

export default function ExpandedEventOverlay({ event, onClose }: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!event) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [event, handleKeyDown]);

  if (!event) return null;

  const status = statusConfig[event.status ?? "ended"] ?? statusConfig.ended;
  const dateRange = formatDateRange(event.starts_on, event.ends_on);
  const discount = event.max_discount_pct ? `최대 ${event.max_discount_pct}%` : null;
  const tags = event.category_tags ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ animation: "expandOverlayIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards" }}
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "expandDimIn 300ms ease forwards" }}
      />

      <div
        className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          animation: "expandCardIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          willChange: "transform, opacity",
          boxShadow: "0 25px 60px -12px hsl(var(--foreground) / 0.25), 0 8px 24px -4px hsl(var(--primary) / 0.15)",
        }}
      >
        {/* Header */}
        <div className="relative shrink-0 bg-gradient-to-br from-primary/10 to-accent/30 p-5 pb-4">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-foreground/10 backdrop-blur-sm rounded-xl p-2 text-foreground/60 hover:bg-foreground/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Radar className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {event.organization_name ?? "알 수 없음"}
            </span>
          </div>

          <h2 className="text-lg font-bold text-card-foreground leading-snug tracking-tight">
            {event.occurrence_title || event.event_name || "이벤트"}
          </h2>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`${status.className} border text-xs font-semibold px-2 py-0.5`}>
              {status.emoji} {status.label}
            </Badge>
            {discount && (
              <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5">
                {discount}
              </Badge>
            )}
          </div>

          {dateRange && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{dateRange}</span>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px] font-semibold rounded-full px-3 py-0.5 bg-secondary/80">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {event.summary && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.summary}
            </p>
          )}

          {event.official_url && (
            <div className="pt-2">
              <Button
                className="w-full rounded-xl gap-2 h-11 font-semibold"
                onClick={() => window.open(event.official_url!, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                공식 페이지 바로가기
              </Button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes expandDimIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes expandOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes expandCardIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
