import { useEffect, useCallback } from "react";
import type { CommunityPost } from "@/hooks/useCommunityPosts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, ThumbsUp, MessageSquare, X } from "lucide-react";
import { timeAgo } from "@/components/community/DealCard";

const categoryStyle: Record<string, { label: string; className: string }> = {
  sale_info: { label: "🏷️ 세일 정보", className: "bg-primary/10 text-primary border-primary/20" },
  hot_deal: { label: "🔥 핫딜", className: "bg-destructive/10 text-destructive border-destructive/20" },
  shopping_tip: { label: "💡 쇼핑 팁", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

interface Props {
  post: CommunityPost | null;
  onClose: () => void;
}

export default function ExpandedCommunityOverlay({ post, onClose }: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!post) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [post, handleKeyDown]);

  if (!post) return null;

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

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          animation: "expandCardIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          willChange: "transform, opacity",
          boxShadow: "0 25px 60px -12px hsl(var(--foreground) / 0.25), 0 8px 24px -4px hsl(var(--primary) / 0.15)",
        }}
      >
        {/* Header */}
        <div className="relative shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 px-5 py-5">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-foreground/10 backdrop-blur-sm rounded-xl p-2 text-foreground/60 hover:bg-foreground/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Category badges */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {post.category.map((c) => {
              const cfg = categoryStyle[c];
              return cfg ? (
                <span key={c} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}>
                  {cfg.label}
                </span>
              ) : null;
            })}
            {post.platform && (
              <Badge variant="secondary" className="text-[11px] font-semibold rounded-full px-3 py-0.5 bg-secondary/80">
                {post.platform}
              </Badge>
            )}
          </div>

          <h2 className="text-lg font-bold text-card-foreground leading-snug tracking-tight">
            {post.title}
          </h2>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {post.author && <span className="font-medium text-foreground/80">{post.author}</span>}
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {post.content && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              추천 {post.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              댓글 {post.comments_count}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 pt-2">
            {post.external_link && (
              <Button
                className="w-full rounded-xl gap-2 h-11 font-semibold"
                onClick={() => window.open(post.external_link, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                링크 바로가기
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2 h-11 font-semibold border-border/70"
              onClick={onClose}
            >
              닫기
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
