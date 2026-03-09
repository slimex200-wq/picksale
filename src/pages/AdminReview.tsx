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
  CheckCircle, XCircle, Eye, Pencil, ExternalLink, ArrowUpDown,
} from "lucide-react";
import { SaleMetaBadges, SaleSourceLinks } from "@/components/SaleMetaBadges";

export default function AdminReview() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "importance">("newest");

  // Fetch pending + approved(draft) sales for review
  const { data: pendingSales = [], isLoading: l1 } = useAdminSales({
    review_status: "pending",
    platform: platformFilter || undefined,
    sale_tier: tierFilter || undefined,
    sort: sortBy,
  });
  const { data: approvedDraftSales = [], isLoading: l2 } = useAdminSales({
    review_status: "approved",
    publish_status: "draft",
    platform: platformFilter || undefined,
    sale_tier: tierFilter || undefined,
    sort: sortBy,
  });
  const sales = [...pendingSales, ...approvedDraftSales];
  const isLoading = l1 || l2;

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState({
    sale_name: "", platform: "", link: "", start_date: "", end_date: "",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sales"] });

  const handleAction = async (id: string, action: "approve" | "reject" | "publish" | "hide") => {
    const updates: Record<string, string> = {};
    if (action === "approve") { updates.review_status = "approved"; updates.publish_status = "draft"; }
    else if (action === "reject") { updates.review_status = "rejected"; }
    else if (action === "publish") { updates.review_status = "approved"; updates.publish_status = "published"; }
    else if (action === "hide") { updates.publish_status = "hidden"; }

    const { error } = await supabase.from("sales").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    const msg = { approve: "승인되었습니다.", reject: "반려되었습니다.", publish: "게시되었습니다.", hide: "숨김 처리되었습니다." };
    toast.success(msg[action]);
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

  const tierColor = (tier: string) => {
    if (tier === "major") return "bg-primary/15 text-primary border-primary/30";
    if (tier === "minor") return "bg-secondary text-secondary-foreground";
    return "bg-muted text-muted-foreground";
  };

  const tierLabel = (tier: string) => {
    if (tier === "major") return "주요";
    if (tier === "minor") return "일반";
    return "제외";
  };

  return (
    <div className="space-y-4">
      {/* 필터 */}
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
        <div className="space-y-1">
          <Label className="text-xs">등급</Label>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="전체" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="major">주요</SelectItem>
              <SelectItem value="minor">일반</SelectItem>
              <SelectItem value="excluded">제외</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs"
          onClick={() => setSortBy(sortBy === "newest" ? "importance" : "newest")}>
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === "newest" ? "최신순" : "중요도순"}
        </Button>
      </div>

      {/* 목록 */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">대기 중인 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Badge variant="outline" className={`text-[10px] ${tierColor(sale.sale_tier)}`}>
                      {tierLabel(sale.sale_tier)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      중요도: {sale.importance_score}
                    </span>
                    {sale.grouped_page_count > 0 && (
                      <span className="text-[10px] text-muted-foreground">· {sale.grouped_page_count}개 페이지</span>
                    )}
                    <SaleMetaBadges sale={sale} />
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{sale.sale_name}</p>
                  <p className="text-xs text-muted-foreground">{sale.platform} · {sale.start_date} ~ {sale.end_date}</p>
                  {sale.filter_reason && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">사유: {sale.filter_reason}</p>
                  )}
                </div>
                {sale.image_url && (
                  <img src={sale.image_url} alt="" className="w-16 h-16 rounded-md object-cover shrink-0" />
                )}
                {sale.link && (
                  <a href={sale.link} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>

              <SaleSourceLinks sale={sale} />

              {sale.created_at && (
                <p className="text-[10px] text-muted-foreground">
                  등록일: {new Date(sale.created_at).toLocaleString("ko-KR")}
                </p>
              )}

              <div className="flex gap-1.5 pt-1 flex-wrap">
                <Button size="sm" className="gap-1 text-xs h-7" onClick={() => handleAction(sale.id, "approve")}>
                  <CheckCircle className="w-3 h-3" />승인
                </Button>
                <Button size="sm" variant="default" className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction(sale.id, "publish")}>
                  <Eye className="w-3 h-3" />게시
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleAction(sale.id, "reject")}>
                  <XCircle className="w-3 h-3" />반려
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => openEdit(sale)}>
                  <Pencil className="w-3 h-3" />수정
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수정 다이얼로그 */}
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
              <Input type="url" placeholder="https://www.musinsa.com/app/plan/..." value={editForm.link} onChange={(e) => setEditForm((f) => ({ ...f, link: e.target.value }))} />
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
