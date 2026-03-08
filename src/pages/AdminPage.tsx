import { useState } from "react";
import { useSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { platforms, Platform, Sale } from "@/data/salesUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Settings, CheckCircle, ExternalLink } from "lucide-react";

interface FormState {
  platform: string;
  sale_name: string;
  start_date: string;
  end_date: string;
  category: string;
  link: string;
  description: string;
}

const emptyForm: FormState = {
  platform: "",
  sale_name: "",
  start_date: "",
  end_date: "",
  category: "",
  link: "",
  description: "",
};

function saleToForm(sale: Sale): FormState {
  return {
    platform: sale.platform,
    sale_name: sale.sale_name,
    start_date: sale.start_date,
    end_date: sale.end_date,
    category: sale.category.join(", "),
    link: sale.link,
    description: sale.description,
  };
}

interface CommunityPost {
  id: string;
  platform: string | null;
  title: string;
  content: string | null;
  external_link: string;
  category: string[];
  author: string | null;
  source_type: string | null;
  review_status: string;
  created_at: string;
}

export default function AdminPage() {
  const { data: sales = [], isLoading } = useSales();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Community posts query
  const { data: communityPosts = [], isLoading: communityLoading } = useQuery({
    queryKey: ["community_posts", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("review_status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CommunityPost[];
    },
  });

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setForm(saleToForm(sale));
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform || !form.sale_name || !form.start_date || !form.end_date) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    const categories = form.category
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      platform: form.platform,
      sale_name: form.sale_name,
      start_date: form.start_date,
      end_date: form.end_date,
      category: categories,
      link: form.link || "",
      description: form.description || "",
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("sales")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("세일이 수정되었습니다.");
      } else {
        const { error } = await supabase.from("sales").insert(payload);
        if (error) throw error;
        toast.success("세일이 등록되었습니다.");
      }
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const { data, error } = await supabase
        .from("sales")
        .delete()
        .eq("id", id)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("삭제 권한이 없거나 이미 삭제된 항목입니다.");

      toast.success("삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    } catch (err: any) {
      toast.error(err.message || "삭제에 실패했습니다.");
    }
  };

  const handleApprove = async (post: CommunityPost) => {
    try {
      // Insert into sales
      const { error: insertError } = await supabase.from("sales").insert({
        platform: "커뮤니티 핫딜",
        sale_name: post.title,
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        category: post.category,
        link: post.external_link,
        description: post.content || "",
      });
      if (insertError) throw insertError;

      // Update community_posts status
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
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">관리</h2>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="sales" className="flex-1">Sales</TabsTrigger>
          <TabsTrigger value="community" className="flex-1">
            Community Inbox
            {communityPosts.length > 0 && (
              <span className="ml-1.5 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                {communityPosts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1.5 rounded-md" onClick={openCreate}>
              <Plus className="w-4 h-4" />
              추가
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
          ) : sales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">등록된 세일이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">
                      {sale.sale_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.platform} · {sale.start_date} ~ {sale.end_date}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(sale)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(sale.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Community Inbox Tab */}
        <TabsContent value="community">
          {communityLoading ? (
            <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
          ) : communityPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">대기 중인 커뮤니티 글이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {communityPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-card border border-border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-card-foreground truncate">
                        {post.title}
                      </p>
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
                        <span key={c} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1 text-xs h-7"
                      onClick={() => handleApprove(post)}
                    >
                      <CheckCircle className="w-3 h-3" />
                      승인 → Sales
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => handleReject(post.id)}
                    >
                      반려
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "세일 수정" : "세일 추가"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm">플랫폼 *</Label>
              <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">세일 이름 *</Label>
              <Input
                value={form.sale_name}
                onChange={(e) => update("sale_name", e.target.value)}
                placeholder="예: 올영세일"
                className="rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">시작일 *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => update("start_date", e.target.value)}
                  className="rounded-md"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">종료일 *</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => update("end_date", e.target.value)}
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">카테고리</Label>
              <Input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="뷰티, 패션 (쉼표 구분)"
                className="rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">링크</Label>
              <Input
                value={form.link}
                onChange={(e) => update("link", e.target.value)}
                placeholder="https://..."
                className="rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">설명</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="세일 설명"
                className="rounded-md resize-none"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full rounded-md" disabled={submitting}>
              {submitting ? "저장 중..." : editingId ? "수정하기" : "등록하기"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
