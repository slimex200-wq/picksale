import { useState } from "react";
import { Link } from "react-router-dom";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { useAuth } from "@/hooks/useAuth";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import DealCard from "@/components/community/DealCard";
import PopularDeals from "@/components/community/PopularDeals";
import { DealFeedSkeleton } from "@/components/community/DealFeedSkeleton";
import {
  Plus, TrendingUp, Clock, ThumbsUp, Zap, Search,
} from "lucide-react";

const categories = [
  { key: "all", label: "전체", emoji: "🔥" },
  { key: "sale_info", label: "세일 정보", emoji: "🏷️" },
  { key: "hot_deal", label: "핫딜", emoji: "💰" },
  { key: "shopping_tip", label: "쇼핑 팁", emoji: "💡" },
];

const sortOptions = [
  { key: "trending", label: "트렌딩", icon: TrendingUp },
  { key: "newest", label: "최신순", icon: Clock },
  { key: "upvotes", label: "추천순", icon: ThumbsUp },
] as const;

export default function CommunityPage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"newest" | "upvotes" | "trending">("newest");
  const { data: posts = [], isLoading } = useCommunityPosts({ category, sort });
  const { user } = useAuth();
  const bp = useBreakpoint();

  const mainContent = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2 tracking-tight">
            <Zap className="w-5 h-5 text-primary" />
            딜 발견
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            유저들이 발견한 핫딜 · 세일 정보 · 쇼핑 팁
          </p>
        </div>
        <Link
          to={user ? "/submit" : "/login"}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          딜 공유
        </Link>
      </div>

      {/* Category Filter — pill tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-all relative ${
              category === cat.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-sm">{cat.emoji}</span>
            {cat.label}
            {category === cat.key && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1 w-fit">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sort === opt.key
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <opt.icon className="w-3 h-3" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Deal Feed */}
      {isLoading && !posts.length ? (
        <DealFeedSkeleton count={5} />
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium">아직 공유된 딜이 없습니다.</p>
          <Link to="/submit" className="text-primary text-sm font-semibold mt-2 inline-block hover:underline">
            첫 번째 딜을 공유해보세요 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <DealCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-28 sm:pb-24">
      <PageMeta
        title="딜 발견 - 커뮤니티 | PickSale"
        description="유저들이 발견한 핫딜, 세일 정보, 쇼핑 팁을 확인하세요."
      />
      <CanonicalLink href={window.location.origin + "/community"} />

      {bp === "desktop" ? (
        <div className="grid grid-cols-[1fr_300px] gap-6 min-w-0">
          <main className="min-w-0 overflow-hidden">{mainContent}</main>
          <PopularDeals />
        </div>
      ) : (
        mainContent
      )}

      {/* Floating CTA (mobile) */}
      <Link
        to={user ? "/submit" : "/login"}
        className="fixed bottom-[5.5rem] right-4 z-40 md:hidden flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        딜 공유
      </Link>
    </div>
  );
}
