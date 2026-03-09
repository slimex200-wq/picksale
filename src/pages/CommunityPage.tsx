import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";
import { useCommunityPosts, CommunityPost } from "@/hooks/useCommunityPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { toast } from "sonner";
import {
  ThumbsUp, MessageSquare, ExternalLink, Plus, TrendingUp, Clock,
  Radar, ChevronRight, Sparkles, Flame,
} from "lucide-react";

const categories = [
  { key: "all", label: "전체", emoji: "📡" },
  { key: "sale_info", label: "세일 정보", emoji: "🏷️" },
  { key: "hot_deal", label: "핫딜", emoji: "🔥" },
  { key: "shopping_tip", label: "쇼핑 팁", emoji: "💡" },
];

const sortOptions = [
  { key: "trending", label: "트렌딩", icon: TrendingUp },
  { key: "newest", label: "최신순", icon: Clock },
  { key: "upvotes", label: "추천순", icon: ThumbsUp },
] as const;

export default function CommunityPage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"newest" | "upvotes" | "trending">("trending");
  const { data: posts = [], isLoading } = useCommunityPosts({ category, sort });
  const { data: trendingPosts = [] } = useCommunityPosts({ sort: "trending", limit: 5 });
  const { user } = useAuth();
  const bp = useBreakpoint();

  const saleInfoPosts = category === "all" ? posts.filter(p => p.category.includes("sale_info")).slice(0, 3) : [];
  const remainingPosts = category === "all"
    ? posts.filter(p => !saleInfoPosts.some(s => s.id === p.id))
    : posts;

  const mainContent = (
    <>
      {/* Header + CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 tracking-tight">
            <Radar className="w-5 h-5 text-primary" />
            세일 레이더
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">세일 발견 · 핫딜 · 쇼핑 팁을 공유하세요</p>
        </div>
        <Link
          to={user ? "/submit" : "/login"}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          글쓰기
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button key={cat.key} onClick={() => setCategory(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border ${
              category === cat.key
                ? "bg-primary text-primary-foreground border-primary shadow-sm font-bold"
                : "bg-card text-foreground/70 border-border hover:bg-accent hover:border-border/80"
            }`}>
            <span>{cat.emoji}</span>{cat.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-1">
        {sortOptions.map((opt) => (
          <button key={opt.key} onClick={() => setSort(opt.key)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sort === opt.key ? "bg-card border border-border text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            <opt.icon className="w-3 h-3" />{opt.label}
          </button>
        ))}
      </div>

      {/* Featured Sale Info Section */}
      {saleInfoPosts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />세일 발견 하이라이트
          </h2>
          <div className="space-y-2">
            {saleInfoPosts.map((post) => <FeaturedPostCard key={post.id} post={post} />)}
          </div>
        </div>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : remainingPosts.length === 0 && saleInfoPosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Radar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm">아직 게시글이 없습니다.</p>
          <Link to="/submit" className="text-primary text-sm font-medium mt-2 inline-block">첫 세일 정보를 공유해보세요 →</Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {remainingPosts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </>
  );

  const sidebar = (
    <aside className="space-y-4 sticky top-16">
      {/* Trending */}
      <section className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          트렌딩 게시글
        </h3>
        <div className="space-y-2">
          {trendingPosts.slice(0, 5).map((post, i) => (
            <Link key={post.id} to={`/community/${post.id}`} className="flex items-center gap-2 hover:bg-accent rounded-lg p-1.5 -mx-1.5 transition-colors">
              <span className="text-xs font-bold text-muted-foreground w-4 text-center shrink-0">{i + 1}</span>
              <p className="text-xs font-medium text-card-foreground truncate flex-1">{post.title}</p>
              <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5">
                <ThumbsUp className="w-2.5 h-2.5" />{post.upvotes}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Write CTA */}
      <section className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">세일 정보를 발견하셨나요?</p>
        <p className="text-xs text-muted-foreground">커뮤니티에 공유하면 다른 사람들에게 도움이 됩니다.</p>
        <Link
          to={user ? "/submit" : "/login"}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />글쓰기
        </Link>
      </section>
    </aside>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-20 sm:pb-24">
      <PageMeta title="세일 레이더 - 커뮤니티 | PickSale" description="세일 발견, 핫딜, 쇼핑 팁을 공유하는 PickSale 커뮤니티입니다." />
      <CanonicalLink href={window.location.origin + "/community"} />

      {bp === "desktop" ? (
        <div className="grid grid-cols-[1fr_280px] gap-6 min-w-0">
          <main className="space-y-4 min-w-0 overflow-hidden">
            {mainContent}
          </main>
          {sidebar}
        </div>
      ) : (
        <div className="space-y-4">
          {mainContent}
        </div>
      )}

      {/* Floating CTA (mobile) */}
      <Link
        to={user ? "/submit" : "/login"}
        className="fixed bottom-20 right-4 z-40 md:hidden flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" />글쓰기
      </Link>
    </div>
  );
}

/* ── Featured card ── */
function FeaturedPostCard({ post }: { post: CommunityPost }) {
  return (
    <Link to={`/community/${post.id}`}
      className="block bg-card border border-primary/20 rounded-2xl p-4 hover:shadow-md transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="flex items-start gap-3 relative">
        <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl bg-primary/10 shrink-0">
          <ThumbsUp className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">{post.upvotes}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">🏷️ 세일 정보</span>
            {post.platform && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{post.platform}</span>}
          </div>
          <p className="text-sm font-semibold text-card-foreground leading-snug line-clamp-2">{post.title}</p>
          {post.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.content}</p>}
          <div className="flex items-center gap-2.5 mt-2 text-[11px] text-muted-foreground">
            {post.author && <span className="font-medium text-foreground">{post.author}</span>}
            <span>{timeAgo(post.created_at)}</span>
            <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{post.comments_count}</span>
            {post.is_sale_signal && <span className="text-primary font-semibold">📡 시그널</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1" />
      </div>
    </Link>
  );
}

/* ── Compact post card ── */
function PostCard({ post }: { post: CommunityPost }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upvoting, setUpvoting] = useState(false);

  const categoryStyle: Record<string, { label: string; className: string }> = {
    sale_info: { label: "🏷️ 세일", className: "bg-blue-50 text-blue-600 border-blue-100" },
    hot_deal: { label: "🔥 핫딜", className: "bg-red-50 text-red-600 border-red-100" },
    shopping_tip: { label: "💡 팁", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  };

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
    <Link to={`/community/${post.id}`}
      className="flex items-center gap-3 p-3 sm:p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-all">
      <button onClick={handleUpvote} disabled={upvoting}
        className="flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors shrink-0 min-w-[44px]">
        <ThumbsUp className={`w-4 h-4 ${post.upvotes > 0 ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-xs font-bold text-foreground">{post.upvotes}</span>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap mb-0.5">
          {post.category.map((c) => {
            const cfg = categoryStyle[c];
            return cfg ? (
              <span key={c} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.className}`}>{cfg.label}</span>
            ) : null;
          })}
          {post.platform && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{post.platform}</span>}
        </div>
        <p className="text-sm font-semibold text-card-foreground line-clamp-2 leading-snug">{post.title}</p>
        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-muted-foreground">
          {post.author && <span className="font-medium text-foreground">{post.author}</span>}
          <span>{timeAgo(post.created_at)}</span>
          <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{post.comments_count}</span>
          {post.external_link && <span className="flex items-center gap-0.5 text-primary"><ExternalLink className="w-3 h-3" /></span>}
          {post.is_sale_signal && <span className="text-primary font-semibold text-[10px]">📡</span>}
        </div>
      </div>
    </Link>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
