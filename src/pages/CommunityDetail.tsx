import { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ThumbsUp, MessageSquare, ExternalLink, ArrowLeft, Send,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const categoryLabels: Record<string, { label: string; className: string }> = {
  sale_info: { label: "세일 정보", className: "bg-blue-100 text-blue-700 border-blue-200" },
  hot_deal: { label: "핫딜", className: "bg-red-100 text-red-700 border-red-200" },
  shopping_tip: { label: "쇼핑 팁", className: "bg-green-100 text-green-700 border-green-200" },
};

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["community_post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["community_comments", id],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", id!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Comment[];
    },
    enabled: !!id,
  });

  const handleUpvote = async () => {
    if (!post) return;
    try {
      const fingerprint = `anon_${navigator.userAgent.slice(0, 20)}_${window.screen.width}`;
      const { error } = await supabase
        .from("community_upvotes")
        .insert({ post_id: post.id, fingerprint });

      if (error) {
        if (error.code === "23505") { toast.info("이미 추천했습니다."); return; }
        throw error;
      }

      await supabase.from("community_posts").update({ upvotes: post.upvotes + 1 }).eq("id", post.id);
      await supabase.rpc("recalc_signal_score", { p_post_id: post.id });

      toast.success("추천했습니다! 👍");
      queryClient.invalidateQueries({ queryKey: ["community_post", id] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "실패했습니다.");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("community_comments").insert({
        post_id: id,
        author_name: authorName.trim() || "익명",
        content: commentText.trim(),
      });
      if (error) throw error;

      // Increment comments_count
      await supabase
        .from("community_posts")
        .update({ comments_count: (post?.comments_count ?? 0) + 1 })
        .eq("id", id);

      await supabase.rpc("recalc_signal_score", { p_post_id: id });

      setCommentText("");
      toast.success("댓글이 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["community_comments", id] });
      queryClient.invalidateQueries({ queryKey: ["community_post", id] });
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "댓글 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  };

  if (postLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 text-center py-16">
        <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
        <Link to="/community" className="text-primary text-sm mt-2 inline-block">← 목록으로</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-4">
      <PageMeta title={`${post.title} | PickSale 커뮤니티`} description={post.content?.slice(0, 150) || `${post.title} - PickSale 커뮤니티 게시글`} />
      <CanonicalLink href={`${window.location.origin}/community/${id}`} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        headline: post.title,
        text: post.content || "",
        datePublished: post.created_at,
        dateModified: post.updated_at,
        url: `${window.location.origin}${location.pathname}`,
        interactionStatistic: [
          { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.upvotes },
          { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: post.comments_count },
        ],
        ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
        ...(post.external_link ? { url: post.external_link } : {}),
      }} />
      <Link to="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />목록
      </Link>

      {/* Post */}
      <article className="bg-card border border-border rounded-xl p-4 space-y-3">
        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.category?.map((c: string) => {
            const cfg = categoryLabels[c];
            return cfg ? (
              <span key={c} className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}>
                {cfg.label}
              </span>
            ) : null;
          })}
          {post.platform && (
            <Badge variant="outline" className="text-[10px]">{post.platform}</Badge>
          )}
        </div>

        <h1 className="text-lg font-bold text-foreground leading-tight">{post.title}</h1>

        <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>

        {post.content && (
          <div className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        )}

        {post.external_link && (
          <a
            href={post.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline bg-primary/5 px-3 py-2 rounded-lg"
          >
            <ExternalLink className="w-4 h-4" />
            링크 열기
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <button onClick={handleUpvote} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-medium">{post.upvotes}</span>
            추천
          </button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">{post.comments_count}</span>
            댓글
          </span>
          {post.is_sale_signal && (
            <span className="text-sm text-primary font-medium ml-auto">📡 시그널 감지됨</span>
          )}
        </div>
      </article>

      {/* Comments */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">댓글 {comments.length}개</h3>

        {commentsLoading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">첫 댓글을 남겨보세요!</p>
        ) : (
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">{c.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-card-foreground">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comment Form */}
        <form onSubmit={handleComment} className="space-y-2 pt-2">
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="닉네임 (선택)"
            className="rounded-lg text-sm h-9"
          />
          <div className="flex gap-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="rounded-lg resize-none text-sm flex-1"
              rows={2}
            />
            <Button type="submit" size="sm" disabled={submitting || !commentText.trim()} className="self-end rounded-lg h-9">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
