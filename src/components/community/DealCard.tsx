import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ThumbsUp, MessageSquare, ExternalLink, Clock } from "lucide-react";
import type { CommunityPost } from "@/hooks/useCommunityPosts";

const categoryStyle: Record<string, { label: string; className: string }> = {
  sale_info: { label: "🏷️ 세일 정보", className: "bg-primary/10 text-primary border-primary/20" },
  hot_deal: { label: "🔥 핫딜", className: "bg-destructive/10 text-destructive border-destructive/20" },
  shopping_tip: { label: "💡 쇼핑 팁", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function DealCard({ post }: { post: CommunityPost }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setUpvoting(true);
    try {
      const { error: upvoteError } = await supabase
        .from("community_upvotes")
        .insert({ post_id: post.id, fingerprint: user.id, user_id: user.id });

      if (upvoteError) {
        if (upvoteError.code === "23505") { toast.info("이미 추천했습니다."); return; }
        throw upvoteError;
      }

      toast.success("추천! 👍");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "추천에 실패했습니다.");
    } finally {
      setUpvoting(false);
    }
  };

  return (
    <Link
      to={`/community/${post.id}`}
      className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-border/80 transition-all"
    >
      <div className="p-4 space-y-2.5">
        {/* Category + Platform badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.category.map((c) => {
            const cfg = categoryStyle[c];
            return cfg ? (
              <span key={c} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}>
                {cfg.label}
              </span>
            ) : null;
          })}
          {post.platform && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {post.platform}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* Content preview */}
        {post.content && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {post.content}
          </p>
        )}

        {/* Footer: meta + actions */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {post.author && <span className="font-medium text-foreground/80">{post.author}</span>}
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {timeAgo(post.created_at)}
            </span>
            {post.external_link && (
              <span className="flex items-center gap-0.5 text-primary">
                <ExternalLink className="w-3 h-3" />
                링크
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.comments_count}
            </span>
            <button
              onClick={handleUpvote}
              disabled={upvoting}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                post.upvotes > 0
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {post.upvotes}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
