// @ts-nocheck
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, ExternalLink, ThumbsUp, MessageSquare, Radio, Trash2, Filter } from "lucide-react";

interface CommunityPost {
  id: string;
  platform: string | null;
  title: string;
  content: string | null;
  external_link: string;
  category: string[];
  author: string | null;
  upvotes: number;
  comments_count: number;
  signal_score: number;
  is_sale_signal: boolean;
  review_status: string;
  source_type: string | null;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  sale_info: "세일 정보",
  hot_deal: "핫딜",
  shopping_tip: "쇼핑 팁",
};

const statusFilters = [
  { key: "all", label: "전체" },
  { key: "pending", label: "검토 대기" },
  { key: "published", label: "게시됨" },
  { key: "hidden", label: "숨김" },
];

export default function AdminCommunity() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community_posts", "admin", statusFilter],
    queryFn: async (): Promise<CommunityPost[]> => {
      let q = supabase.from("community_posts").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("review_status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CommunityPost[];
    },
  });

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase.from("community_posts").update({ review_status: "published" }).eq("id", id);
      if (error) throw error;
      toast.success("승인되어 공개되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "승인에 실패했습니다.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase.from("community_posts").update({ review_status: "hidden" }).eq("id", id);
      if (error) throw error;
      toast.success("반려(숨김) 처리되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "반려에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase.from("community_posts").delete().eq("id", id);
      if (error) throw error;
      toast.success("삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "삭제에 실패했습니다.");
    }
  };

  const handleCreateSignal = async (post: CommunityPost) => {
    try {
      const { error } = await supabase.from("sale_signals").insert({
        platform: post.platform || "커뮤니티 핫딜",
        source_type: "community",
        source_url: post.external_link || "",
        raw_title: post.title,
        raw_text: post.content || "",
        confidence: Math.min(post.signal_score / 20, 1),
        review_status: "pending",
      });
      if (error) throw error;

      await supabase.from("community_posts").update({ is_sale_signal: true }).eq("id", post.id);

      toast.success("시그널로 생성되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
      queryClient.invalidateQueries({ queryKey: ["sale_signals"] });
    } catch (err: any) {
      toast.error(err.message || "실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{posts.length}개 게시글</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {statusFilter === "pending" ? "검토 대기 중인 글이 없습니다." : "게시글이 없습니다."}
        </p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {post.category.map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px]">
                        {categoryLabels[c] || c}
                      </Badge>
                    ))}
                    {post.is_sale_signal && (
                      <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                        <Radio className="w-2.5 h-2.5 mr-0.5" />시그널
                      </Badge>
                    )}
                    <Badge variant={post.review_status === "pending" ? "default" : post.review_status === "published" ? "secondary" : "outline"} className="text-[10px]">
                      {post.review_status === "pending" ? "검토 대기" : post.review_status === "published" ? "게시됨" : post.review_status}
                    </Badge>
                    {post.source_type && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {post.source_type === "crawler" ? "🤖 크롤러" : post.source_type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.platform || "미지정"} · {post.author || "익명"} · {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                {post.external_link && (
                  <a href={post.external_link} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{post.upvotes}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comments_count}</span>
                <span>점수: {post.signal_score}</span>
              </div>

              <div className="flex gap-1.5 pt-1 flex-wrap">
                {post.review_status === "pending" && (
                  <>
                    <Button size="sm" className="gap-1 text-xs h-7" onClick={() => handleApprove(post.id)}>
                      <CheckCircle className="w-3 h-3" />승인
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleReject(post.id)}>
                      <XCircle className="w-3 h-3" />반려
                    </Button>
                  </>
                )}
                {post.review_status === "published" && !post.is_sale_signal && (
                  <Button size="sm" className="gap-1 text-xs h-7" onClick={() => handleCreateSignal(post)}>
                    <Radio className="w-3 h-3" />시그널 생성
                  </Button>
                )}
                {post.review_status === "published" && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleReject(post.id)}>
                    <XCircle className="w-3 h-3" />숨김
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="w-3 h-3" />삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}