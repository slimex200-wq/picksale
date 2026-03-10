import { Link } from "react-router-dom";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { ThumbsUp, MessageSquare, ChevronRight } from "lucide-react";
import communityIcon from "@/assets/community_icon.svg";

interface Props {
  maxPosts?: number;
}

const PLACEHOLDER_THUMBS = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=80&h=80&fit=crop",
];

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
          <div className="w-7 h-7 bg-orange-50 rounded-lg p-1 flex items-center justify-center">
            <img src={communityIcon} alt="" className="w-full h-full text-orange-500" style={{ filter: "invert(62%) sepia(85%) saturate(2000%) hue-rotate(360deg) brightness(100%) contrast(100%)" }} />
          </div>
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
            className="flex items-center gap-3 p-2.5 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow"
          >
            <span className="font-bold text-muted-foreground w-5 text-center shrink-0" style={{ fontSize: '13px', fontWeight: '700' }}>
              {i + 1}
            </span>
            {/* Thumbnail */}
            <img
              src={PLACEHOLDER_THUMBS[i % PLACEHOLDER_THUMBS.length]}
              alt=""
              className="w-10 h-10 rounded-md object-cover bg-accent shrink-0"
              loading="lazy"
            />
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
