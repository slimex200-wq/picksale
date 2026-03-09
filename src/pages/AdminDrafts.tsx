// @ts-nocheck
import { useState, useMemo } from "react";
import { useAdminSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sale, platforms } from "@/data/salesUtils";
import { getSalePrimaryState } from "@/data/adminStateModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import AdminSaleCard from "@/components/admin/AdminSaleCard";
import AdminEditDialog from "@/components/admin/AdminEditDialog";
import { useDuplicateMaps } from "@/hooks/useDuplicateMaps";

export default function AdminDrafts() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "importance">("newest");

  const { data: rawSales = [], isLoading } = useAdminSales({ sort: sortBy });

  const { duplicatePublished, duplicateDrafts } = useDuplicateMaps(rawSales);

  const sales = useMemo(() => {
    let filtered = rawSales.filter(s => getSalePrimaryState(s) === "approved_draft");
    if (platformFilter && platformFilter !== "all") {
      filtered = filtered.filter(s => s.platform === platformFilter);
    }
    return filtered;
  }, [rawSales, platformFilter]);

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sales"] });

  const handleAction = async (id: string, action: string) => {
    const updates: Record<string, string> = {};
    if (action === "publish") { updates.review_status = "approved"; updates.publish_status = "published"; }
    else if (action === "reject") { updates.review_status = "rejected"; }
    else if (action === "hide") { updates.publish_status = "hidden"; }
    else if (action === "restore_review") { updates.review_status = "pending"; updates.publish_status = "draft"; }

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
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs"
          onClick={() => setSortBy(sortBy === "newest" ? "importance" : "newest")}>
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === "newest" ? "최신순" : "중요도순"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{sales.length}개 승인(초안)</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">승인(초안) 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <AdminSaleCard
              key={sale.id}
              sale={sale}
              duplicatePublished={duplicatePublished}
              duplicateDrafts={duplicateDrafts}
              actions={["publish", "reject", "restore_review", "edit"]}
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
