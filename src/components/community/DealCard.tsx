import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { ThumbsUp, MessageSquare, ExternalLink, Clock, Pencil, Trash2, EyeOff, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CommunityPost } from "@/hooks/useCommunityPosts";

const categoryStyle: Record<string, { label: string; className: string }> = {
  sale_info: { label: "🏷️ 세일 정보", className: "bg-primary/10 text-primary border-primary/20" },
  hot_deal: { label: "🔥 핫딜", className: "bg-destructive/10 text-destructive border-destructive/20" },
  shopping_tip: { label: "💡 쇼핑 팁", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

const platformColor: Record<string, string> = {
  쿠팡: "bg-[hsl(4,58%,59%)]/15 text-[hsl(4,58%,42%)] border-[hsl(4,58%,59%)]/25",
  올리브영: "bg-[hsl(153,40%,48%)]/15 text-[hsl(153,40%,32%)] border-[hsl(153,40%,48%)]/25",
  무신사: "bg-[hsl(0,0%,27%)]/15 text-[hsl(0,0%,20%)] border-[hsl(0,0%,27%)]/25",
  KREAM: "bg-[hsl(16,72%,56%)]/15 text-[hsl(16,72%,38%)] border-[hsl(16,72%,56%)]/25",
  SSG: "bg-[hsl(339,52%,52%)]/15 text-[hsl(339,52%,38%)] border-[hsl(339,52%,52%)]/25",
  오늘의집: "bg-[hsl(183,64%,44%)]/15 text-[hsl(183,64%,30%)] border-[hsl(183,64%,44%)]/25",
  "29CM": "bg-[hsl(30,24%,44%)]/15 text-[hsl(30,24%,32%)] border-[hsl(30,24%,44%)]/25",
  WCONCEPT: "bg-[hsl(262,26%,52%)]/15 text-[hsl(262,26%,38%)] border-[hsl(262,26%,52%)]/25",
};

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function DealCard({ post, onOpenDetail }: { post: CommunityPost; onOpenDetail?: (post: CommunityPost) => void }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [upvoting, setUpvoting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLink, setEditLink] = useState("");
  const [saving, setSaving] = useState(false);

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

  const openEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTitle(post.title);
    setEditContent(post.content || "");
    setEditLink(post.external_link || "");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("community_posts")
        .update({ title: editTitle.trim(), content: editContent.trim() || null, external_link: editLink.trim() })
        .eq("id", post.id);
      if (error) throw error;
      toast.success("수정되었습니다.");
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleHide = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { error } = await supabase.from("community_posts").update({ review_status: "hidden" }).eq("id", post.id);
      if (error) throw error;
      toast.success("숨김 처리되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "실패했습니다.");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      const { error } = await supabase.from("community_posts").delete().eq("id", post.id);
      if (error) throw error;
      toast.success("삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["community_posts"] });
    } catch (err: any) {
      toast.error(err.message || "삭제에 실패했습니다.");
    }
  };

  const cardContent = (
    <div className="px-5 sm:px-6 py-4 space-y-2.5">
      {/* Category + Platform badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {post.category.map((c) => {
          const cfg = categoryStyle[c];
          return cfg ? (
            <span key={c} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.className}`}>
              {cfg.label}
            </span>
          ) : null;
        })}
        {post.platform ? (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${platformColor[post.platform] ?? "bg-muted text-muted-foreground border-border/50"}`}>
            {post.platform}
          </span>
        ) : post.source_type ? (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/40">
            {post.source_type}
          </span>
        ) : null}

        {/* Admin menu */}
        {isAdmin && (
          <div className="ml-auto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={openEdit}>
                  <Pencil className="w-3.5 h-3.5 mr-2" />수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHide}>
                  <EyeOff className="w-3.5 h-3.5 mr-2" />숨김
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" />삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-bold text-card-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {post.title}
      </h3>

      {/* Content preview */}
      {post.content && (
        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Footer: meta + actions */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {post.author && <span className="font-medium text-foreground/80">{post.author}</span>}
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {timeAgo(post.created_at)}
          </span>
          {post.external_link && (
            <span className="flex items-center gap-0.5 text-primary">
              <ExternalLink className="w-3 h-3" />
              링크
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquare className="w-3.5 h-3.5" />
            {post.comments_count}
          </span>
          <button
            onClick={handleUpvote}
            disabled={upvoting}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
              post.upvotes > 0
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-transparent border border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            {post.upvotes > 0 ? post.upvotes : "첫 추천"}
          </button>
        </div>
      </div>
    </div>
  );

  const wrapperClass = "group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-border/80 transition-all";

  return (
    <>
      {onOpenDetail ? (
        <div onClick={() => onOpenDetail(post)} className={`${wrapperClass} cursor-pointer`}>
          {cardContent}
        </div>
      ) : (
        <Link to={`/community/${post.id}`} className={wrapperClass}>
          {cardContent}
        </Link>
      )}

      {/* Admin Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">게시글 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">제목</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">내용</label>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">외부 링크</label>
              <Input value={editLink} onChange={(e) => setEditLink(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>취소</Button>
            <Button onClick={handleSaveEdit} disabled={saving || !editTitle.trim()}>
              {saving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
