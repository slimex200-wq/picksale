import { useState } from "react";
import { Link } from "react-router-dom";
import { useCommunityPosts, CommunityPost } from "@/hooks/useCommunityPosts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ThumbsUp, MessageSquare, ExternalLink, Plus, TrendingUp, Clock, Flame,
} from "lucide-react";

const categories = [
  { key: "all", label: "전체", emoji: "📋" },
  { key: "sale_info", label: "세일 정보", emoji: "🏷️" },
  { key: "hot_deal", label: "핫딜", emoji: "🔥" },
  { key: "shopping_tip", label: "쇼핑 팁", emoji: "💡" },
];

const sortOptions = [
  { key: "newest", label: "최신순", icon: Clock },
  { key: "upvotes", label: "추천순", icon: ThumbsUp },
  { key: "trending", label: "트렌딩", icon: TrendingUp },
] as const;

export default function CommunityPage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"newest" | "upvotes" | "trending">("newest");
  const { data: posts = [], isLoading } = useCommunityPosts({ category, sort });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            세일 레이더
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">세일 발견, 핫딜, 쇼핑 팁을 공유하세요</p>
        </div>
        <Link to="/submit">
          <Button size="sm" className="gap-1.5 rounded-xl text-xs">
            <Plus className="w-3.5 h-3.5" />글쓰기
          </Button>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-1">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              sort === opt.key
                ? "bg-card border border-border text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <opt.icon className="w-3 h-3" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">아직 게시글이 없습니다.</p>
          <Link to="/submit" className="text-primary text-sm font-medium mt-2 inline-block">
            첫 글을 작성해보세요 →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: CommunityPost }) {
  const queryClient = useQueryClient();
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUpvoting(true);
    try {
      const fingerprint = `anon_${navigator.userAgent.slice(0, 20)}_${window.screen.width}`;

      const { error: upvoteError } = await supabase
        .from("community_upvotes")
        .insert({ post_id: post.id, fingerprint });

      if (upvoteError) {
        if (upvoteError.code === "23505") {
          toast.info("이미 추천했습니다.");
          return;
        }
        throw upvoteError;
      }

      // Increment upvotes
      await supabase
        .from("community_posts")
        .update({ upvotes: post.upvotes + 1 })
        .eq("id", post.id);

      // Recalculate signal score
      await supabase.rpc("recalc_signal_score", { p_post_id: post.id });

      toast.success("추천했습니다! 👍");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "추천에 실패했습니다.");
    } finally {
      setUpvoting(false);
    }
  };

  const categoryLabels: Record<string, { label: string; className: string }> = {
    sale_info: { label: "세일 정보", className: "bg-blue-100 text-blue-700 border-blue-200" },
    hot_deal: { label: "핫딜", className: "bg-red-100 text-red-700 border-red-200" },
    shopping_tip: { label: "쇼핑 팁", className: "bg-green-100 text-green-700 border-green-200" },
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  };

  return (
    <Link
      to={`/community/${post.id}`}
      className="block bg-card border border-border rounded-xl p-3.5 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Upvote button */}
        <button
          onClick={handleUpvote}
          disabled={upvoting}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors shrink-0"
        >
          <ThumbsUp className={`w-4 h-4 ${post.upvotes > 0 ? "text-primary" : "text-muted-foreground"}`} />
          <span className="text-xs font-bold text-foreground">{post.upvotes}</span>
        </button>

        <div className="flex-1 min-w-0">
          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {post.category.map((c) => {
              const cfg = categoryLabels[c];
              return cfg ? (
                <span key={c} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.className}`}>
                  {cfg.label}
                </span>
              ) : null;
            })}
            {post.platform && (
              <span className="text-[10px] text-muted-foreground font-medium">{post.platform}</span>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-card-foreground leading-snug">{post.title}</p>

          {/* Content preview */}
          {post.content && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span>{timeAgo(post.created_at)}</span>
            <span className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" />{post.comments_count}
            </span>
            {post.external_link && (
              <span className="flex items-center gap-0.5 text-primary">
                <ExternalLink className="w-3 h-3" />링크
              </span>
            )}
            {post.is_sale_signal && (
              <span className="text-primary font-medium">📡 시그널</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
