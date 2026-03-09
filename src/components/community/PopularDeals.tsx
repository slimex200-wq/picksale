import { Link } from "react-router-dom";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useAuth } from "@/hooks/useAuth";
import { ThumbsUp, Flame, Plus, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "./DealCard";

export default function PopularDeals() {
  const { data: topPosts = [], isLoading } = useCommunityPosts({ sort: "upvotes", limit: 5 });
  const { user } = useAuth();

  return (
    <aside className="space-y-4 sticky top-16">
      {/* 실시간 인기 딜 */}
      <section className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            실시간 인기 딜
          </h3>
        </div>
        <div className="p-3 space-y-1">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))
          ) : (
            topPosts.map((post, i) => (
              <Link
                key={post.id}
                to={`/community/${post.id}`}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <span className={`text-xs font-extrabold shrink-0 w-5 text-center mt-0.5 ${
                  i < 3 ? "text-primary" : "text-muted-foreground"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-card-foreground line-clamp-2 leading-snug">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{timeAgo(post.created_at)}</span>
                    <span className="flex items-center gap-0.5">
                      <ThumbsUp className="w-2.5 h-2.5" />
                      {post.upvotes}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 딜 공유 CTA */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">핫딜을 발견하셨나요?</p>
          <p className="text-xs text-muted-foreground mt-1">커뮤니티에 공유하고 다른 사람들에게 알려주세요!</p>
        </div>
        <Link
          to={user ? "/submit" : "/login"}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          딜 공유하기
        </Link>
      </section>
    </aside>
  );
}
