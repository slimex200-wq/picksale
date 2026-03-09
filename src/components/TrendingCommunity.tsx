import { Link } from "react-router-dom";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { ThumbsUp, MessageSquare, ChevronRight, Flame } from "lucide-react";

interface Props {
  maxPosts?: number;
}

export default function TrendingCommunity({ maxPosts = 5 }: Props) {
  const { data: posts = [] } = useCommunityPosts({ sort: "trending", limit: maxPosts });

  if (posts.length === 0) return null;

  const categoryEmoji: Record<string, string> = {
    sale_info: "🏷️",
    hot_deal: "🔥",
    shopping_tip: "💡",
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-foreground flex items-center gap-2" style={{ fontSize: '20px', fontWeight: '700' }}>
          <Flame className="w-4.5 h-4.5 text-primary" />
          커뮤니티 트렌딩
        </h2>
        <Link to="/community" className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">
          더보기 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-1.5">
        {posts.map((post, i) => (
          <Link
            key={post.id}
            to={`/community/${post.id}`}
            className="flex items-center gap-2.5 p-2.5 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow"
          >
            <span className="font-bold text-muted-foreground w-5 text-center shrink-0" style={{ fontSize: '13px', fontWeight: '700' }}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                {post.category.map((c) => (
                  <span key={c} style={{ fontSize: '11px' }}>{categoryEmoji[c] || "📋"}</span>
                ))}
                {post.platform && (
                  <span className="text-muted-foreground" style={{ fontSize: '12px', fontWeight: '500' }}>{post.platform}</span>
                )}
              </div>
              <p className="text-card-foreground truncate" style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.45' }}>{post.title}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-muted-foreground" style={{ fontSize: '11px' }}>
              {post.upvotes > 0 && (
                <span className="flex items-center gap-0.5">
                  <ThumbsUp className="w-3 h-3" />{post.upvotes}
                </span>
              )}
              {post.comments_count > 0 && (
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="w-3 h-3" />{post.comments_count}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
