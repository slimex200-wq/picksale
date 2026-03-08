import { useCommunityPosts, CommunityPost } from "@/hooks/useCommunityPosts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, ExternalLink } from "lucide-react";

export default function AdminCommunity() {
  const { data: posts = [], isLoading } = useCommunityPosts();
  const queryClient = useQueryClient();
  const pending = posts.filter((p) => p.review_status === "pending");

  const handleApprove = async (post: CommunityPost) => {
    try {
      const { error: insertError } = await supabase.from("sales").insert({
        platform: "커뮤니티 핫딜",
        sale_name: post.title,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        category: post.category,
        link: post.link,
        description: post.content || "",
      });
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("community_posts")
        .update({ review_status: "approved" })
        .eq("id", post.id);
      if (updateError) throw updateError;

      toast.success("세일로 승격되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "승인에 실패했습니다.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ review_status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      toast.success("반려되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "반려에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{pending.length}개 대기 중</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : pending.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">대기 중인 커뮤니티 글이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {pending.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-card-foreground truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.platform || "미지정"} · {post.author || "익명"} · {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                {post.link && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
              </div>
              {post.content && (
                <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
              )}
              {post.category.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {post.category.map((c) => (
                    <span key={c} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="default" className="gap-1 text-xs h-7" onClick={() => handleApprove(post)}>
                  <CheckCircle className="w-3 h-3" /> 승인 → Sales
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleReject(post.id)}>
                  반려
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
