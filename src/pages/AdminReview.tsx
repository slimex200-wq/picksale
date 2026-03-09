// @ts-nocheck
import { useState } from "react";
import { useAdminSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sale, platforms } from "@/data/salesUtils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import AdminSaleCard from "@/components/admin/AdminSaleCard";
import AdminEditDialog from "@/components/admin/AdminEditDialog";

export default function AdminReview() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "importance">("newest");

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

  let sales = [...pendingSales, ...approvedDraftSales];
  if (sourceFilter && sourceFilter !== "all") {
    sales = sales.filter(s => {
      const st = s.source_type || "";
      if (sourceFilter === "official") return st === "crawler" || st === "official";
      if (sourceFilter === "news") return st === "news";
      if (sourceFilter === "community") return st === "community";
      return true;
    });
  }
  const isLoading = l1 || l2;

  // Fetch all sales for duplicate warning
  const { data: allSales = [] } = useAdminSales();

  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sales"] });

  const handleAction = async (id: string, action: string) => {
    const updates: Record<string, string> = {};
    if (action === "approve") { updates.review_status = "approved"; updates.publish_status = "draft"; }
    else if (action === "reject") { updates.review_status = "rejected"; }
    else if (action === "publish") { updates.review_status = "approved"; updates.publish_status = "published"; }
    else if (action === "hide") { updates.publish_status = "hidden"; }

    const { error } = await supabase.from("sales").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("처리되었습니다.");
    invalidate();
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingSale) return;
    const { error } = await supabase.from("sales").update({
      sale_name: data.sale_name, platform: data.platform,
      link: data.link, start_date: data.start_date, end_date: data.end_date,
      event_key: data.event_key, image_url: data.image_url,
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
        <div className="space-y-1">
          <Label className="text-xs">소스</Label>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="전체" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="official">공식</SelectItem>
              <SelectItem value="news">뉴스</SelectItem>
              <SelectItem value="community">커뮤니티</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs"
          onClick={() => setSortBy(sortBy === "newest" ? "importance" : "newest")}>
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === "newest" ? "최신순" : "중요도순"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{sales.length}개 검토 대기</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">대기 중인 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <AdminSaleCard
              key={sale.id}
              sale={sale}
              allSales={allSales}
              actions={["approve", "publish", "reject", "edit"]}
              onAction={handleAction}
              onEdit={setEditingSale}
            />
          ))}
        </div>
      )}

      <AdminEditDialog sale={editingSale} onClose={() => setEditingSale(null)} onSubmit={handleEditSubmit} />
    </div>
  );
}
