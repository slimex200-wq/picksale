import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { ExternalLink, Flame } from "lucide-react";

export default function CommunityHotDeals() {
  const { data: posts = [], isLoading } = useCommunityPosts();
  const approved = posts.filter((p) => p.review_status === "approved");

  if (isLoading || approved.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-foreground px-1 flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500" />
        커뮤니티 핫딜
        <span className="text-xs text-muted-foreground font-medium ml-1">
          {approved.length}
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {approved.slice(0, 6).map((post) => (
          <a
            key={post.id}
            href={post.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card border border-border rounded-xl p-3 flex items-start gap-3 hover:shadow-md transition-shadow group"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                {post.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {post.platform || "기타"} · {post.author || "익명"} · {new Date(post.created_at).toLocaleDateString("ko-KR")}
              </p>
              {post.category.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-1.5">
                  {post.category.slice(0, 3).map((c) => (
                    <span key={c} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {post.link && (
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
