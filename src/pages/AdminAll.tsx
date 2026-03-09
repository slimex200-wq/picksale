// @ts-nocheck
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAdminSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sale, platforms } from "@/data/salesUtils";
import { getSalePrimaryState, getSourceClass, isRecentlyUpdated, type SalePrimaryState } from "@/data/adminStateModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import AdminSaleCard from "@/components/admin/AdminSaleCard";
import AdminEditDialog from "@/components/admin/AdminEditDialog";
import SourceDistribution from "@/components/admin/SourceDistribution";
import { useDuplicateMaps } from "@/hooks/useDuplicateMaps";

const stateOptions: { value: string; label: string }[] = [
  { value: "all", label: "전체 상태" },
  { value: "review_pending", label: "검토 대기" },
  { value: "approved_draft", label: "승인(초안)" },
  { value: "published", label: "게시됨" },
  { value: "hidden", label: "숨김" },
  { value: "rejected", label: "반려" },
];

export default function AdminAll() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [updatedOnly, setUpdatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "importance" | "updated">("newest");

  const { data: rawSales = [], isLoading } = useAdminSales({ sort: sortBy });

  const { duplicatePublished, duplicateDrafts } = useDuplicateMaps(rawSales);

  const { salesBeforeSource, sales, stateCounts, recentUpdateCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    let recentCount = 0;
    for (const s of rawSales) {
      const st = getSalePrimaryState(s);
      counts[st] = (counts[st] || 0) + 1;
      if (isRecentlyUpdated(s)) recentCount++;
    }

    let filtered = [...rawSales];
    if (stateFilter && stateFilter !== "all") {
      filtered = filtered.filter(s => getSalePrimaryState(s) === stateFilter);
    }
    if (platformFilter && platformFilter !== "all") {
      filtered = filtered.filter(s => s.platform === platformFilter);
    }
    if (tierFilter && tierFilter !== "all") {
      filtered = filtered.filter(s => s.sale_tier === tierFilter);
    }
    if (updatedOnly) {
      filtered = filtered.filter(s => isRecentlyUpdated(s));
    }

    const beforeSource = filtered;

    if (sourceFilter && sourceFilter !== "all") {
      filtered = filtered.filter(s => getSourceClass(s) === sourceFilter);
    }

    // Sort by updated_at if selected
    if (sortBy === "updated") {
      filtered.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
    }

    return { salesBeforeSource: beforeSource, sales: filtered, stateCounts: counts, recentUpdateCount: recentCount };
  }, [rawSales, platformFilter, tierFilter, sourceFilter, stateFilter, updatedOnly, sortBy]);

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sales"] });

  const handleAction = async (id: string, action: string) => {
    if (action === "delete") {
      if (!confirm("정말 삭제하시겠습니까?")) return;
      const { data, error } = await supabase.from("sales").delete().eq("id", id).select("id");
      if (error) { toast.error(error.message); return; }
      if (!data || data.length === 0) { toast.error("삭제에 실패했습니다."); return; }
      toast.success("삭제되었습니다.");
      invalidate();
      return;
    }
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
      {/* State summary chips */}
      <div className="flex flex-wrap gap-1.5">
        {stateOptions.map(({ value, label }) => {
          const count = value === "all" ? rawSales.length : (stateCounts[value] || 0);
          const isActive = (stateFilter || "all") === value;
          return (
            <button
              key={value}
              onClick={() => setStateFilter(value === "all" ? "" : value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {label} {count}
            </button>
          );
        })}
        {/* Recently updated toggle */}
        <button
          onClick={() => setUpdatedOnly(!updatedOnly)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            updatedOnly
              ? "bg-cyan-600 text-white border-cyan-600"
              : "bg-card text-muted-foreground border-border hover:bg-accent"
          }`}
        >
          🔄 최근 갱신 {recentUpdateCount}
        </button>
      </div>

      {/* Filters */}
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
          onClick={() => setSortBy(sortBy === "newest" ? "importance" : sortBy === "importance" ? "updated" : "newest")}>
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === "newest" ? "최신순" : sortBy === "importance" ? "중요도순" : "갱신순"}
        </Button>
      </div>

      <SourceDistribution
        sales={salesBeforeSource}
        activeSource={sourceFilter}
        onSourceChange={setSourceFilter}
        contextLabel={`전체 ${salesBeforeSource.length}건`}
        filteredCount={sales.length}
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {sourceFilter && sourceFilter !== "all"
            ? `'${sourceFilter === "official" ? "공식" : sourceFilter === "news" ? "뉴스" : "커뮤니티"}' 소스에 해당하는 항목이 없습니다.`
            : stateFilter && stateFilter !== "all"
            ? "해당 상태의 항목이 없습니다."
            : "조건에 맞는 이벤트가 없습니다."}
        </p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <AdminSaleCard
              key={sale.id}
              sale={sale}
              duplicatePublished={duplicatePublished}
              duplicateDrafts={duplicateDrafts}
              actions={["approve", "publish", "hide", "reject", "edit", "delete"]}
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
