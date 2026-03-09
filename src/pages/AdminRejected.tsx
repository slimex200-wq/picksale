// @ts-nocheck
import { useState } from "react";
import { useAdminSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sale, platforms } from "@/data/salesUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Eye, Pencil, Trash2, ExternalLink, ArrowUpDown,
} from "lucide-react";

export default function AdminRejected() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "importance">("newest");

  const { data: sales = [], isLoading } = useAdminSales({
    review_status: "rejected",
    platform: platformFilter || undefined,
    sort: sortBy,
  });

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState({
    sale_name: "", platform: "", link: "", start_date: "", end_date: "",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sales"] });

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from("sales").update({ review_status: "pending" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("검토 대기로 복원되었습니다.");
    invalidate();
  };

  const handlePublish = async (id: string) => {
    const { error } = await supabase.from("sales").update({ review_status: "approved", publish_status: "published" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("게시되었습니다.");
    invalidate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { data, error } = await supabase.from("sales").delete().eq("id", id).select("id");
    if (error) { toast.error(error.message); return; }
    if (!data || data.length === 0) { toast.error("삭제에 실패했습니다."); return; }
    toast.success("삭제되었습니다.");
    invalidate();
  };

  const openEdit = (sale: Sale) => {
    setEditingSale(sale);
    setEditForm({ sale_name: sale.sale_name, platform: sale.platform, link: sale.link || "", start_date: sale.start_date, end_date: sale.end_date });
  };

  const handleEditSubmit = async () => {
    if (!editingSale) return;
    const { error } = await supabase.from("sales").update({
      sale_name: editForm.sale_name, platform: editForm.platform,
      link: editForm.link, start_date: editForm.start_date, end_date: editForm.end_date,
    }).eq("id", editingSale.id);
    if (error) { toast.error(error.message); return; }
    toast.success("수정되었습니다.");
    setEditingSale(null);
    invalidate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">플랫폼</Label>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="전체" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs"
          onClick={() => setSortBy(sortBy === "newest" ? "importance" : "newest")}>
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === "newest" ? "최신순" : "중요도순"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{sales.length}개 반려된 이벤트</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">반려된 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                      반려됨
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{sale.platform}</span>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{sale.sale_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{sale.start_date} ~ {sale.end_date}</p>
                  {sale.filter_reason && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">사유: {sale.filter_reason}</p>
                  )}
                </div>
                {sale.link && (
                  <a href={sale.link} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>
              <div className="flex gap-1.5 pt-1 flex-wrap">
                <Button size="sm" variant="outline" className="gap-1 text-xs h-7"
                  onClick={() => handleRestore(sale.id)}>
                  검토로 복원
                </Button>
                <Button size="sm" className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                  onClick={() => handlePublish(sale.id)}>
                  <Eye className="w-3 h-3" /> 게시
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => openEdit(sale)}>
                  <Pencil className="w-3 h-3" /> 수정
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(sale.id)}>
                  <Trash2 className="w-3 h-3" /> 삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editingSale} onOpenChange={(o) => !o && setEditingSale(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>이벤트 수정</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-sm">제목</Label>
              <Input value={editForm.sale_name} onChange={(e) => setEditForm((f) => ({ ...f, sale_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">플랫폼</Label>
              <Select value={editForm.platform} onValueChange={(v) => setEditForm((f) => ({ ...f, platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">링크</Label>
              <Input type="url" placeholder="https://..." value={editForm.link} onChange={(e) => setEditForm((f) => ({ ...f, link: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm">시작일</Label>
                <Input type="date" value={editForm.start_date} onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">종료일</Label>
                <Input type="date" value={editForm.end_date} onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <Button className="w-full" onClick={handleEditSubmit}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
