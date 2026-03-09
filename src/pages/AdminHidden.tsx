// @ts-nocheck
import { useState, useMemo } from "react";
import { useAdminSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sale, platforms, getTodayKST } from "@/data/salesUtils";
import { getSalePrimaryState } from "@/data/adminStateModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download } from "lucide-react";
import AdminSaleCard from "@/components/admin/AdminSaleCard";

export default function AdminHidden() {
  const queryClient = useQueryClient();
  const today = getTodayKST();
  const currentYear = parseInt(today.slice(0, 4));

  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [monthFilter, setMonthFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");

  const { data: rawSales = [], isLoading } = useAdminSales({
    sort: "newest",
  });

  const sales = useMemo(() => {
    // Step 1: canonical state — ONLY hidden
    let filtered = rawSales.filter(s => getSalePrimaryState(s) === "hidden");

    // Step 2: platform
    if (platformFilter && platformFilter !== "all") {
      filtered = filtered.filter(s => s.platform === platformFilter);
    }
    // Step 3: year/month on end_date
    if (yearFilter && yearFilter !== "all") {
      const y = parseInt(yearFilter);
      filtered = filtered.filter(s => {
        if (!s.end_date) return false;
        const ey = parseInt(s.end_date.slice(0, 4));
        if (ey !== y) return false;
        if (monthFilter && monthFilter !== "all") {
          const em = parseInt(s.end_date.slice(5, 7));
          return em === parseInt(monthFilter);
        }
        return true;
      });
    }

    // Sort by end_date descending
    return filtered.sort((a, b) => (b.end_date || "").localeCompare(a.end_date || ""));
  }, [rawSales, platformFilter, yearFilter, monthFilter]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sales"] });

  const handleAction = async (id: string, action: string) => {
    if (action === "restore") {
      const { error } = await supabase.from("sales").update({ publish_status: "published" }).eq("id", id);
      if (error) { toast.error(error.message); return; }
      toast.success("게시 상태로 복원되었습니다.");
      invalidate();
    } else if (action === "delete") {
      if (!window.confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) { toast.error(error.message); return; }
      toast.success("삭제되었습니다.");
      invalidate();
    }
  };

  const handleCSVDownload = () => {
    if (sales.length === 0) { toast.error("다운로드할 데이터가 없습니다."); return; }
    const headers = ["제목", "플랫폼", "시작일", "종료일", "게시상태", "링크"];
    const rows = sales.map(s => [
      `"${s.sale_name.replace(/"/g, '""')}"`, s.platform, s.start_date, s.end_date, s.publish_status, s.link,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `hidden-sales-${today}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV 다운로드 완료");
  };

  const years = Array.from({ length: 3 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">연도</Label>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[90px] h-8 text-xs"><SelectValue placeholder="전체" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {years.map(y => <SelectItem key={y} value={y}>{y}년</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">월</Label>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[80px] h-8 text-xs"><SelectValue placeholder="전체" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {months.map(m => <SelectItem key={m} value={m}>{m}월</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">플랫폼</Label>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="전체" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={handleCSVDownload}>
          <Download className="w-3 h-3" /> CSV
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{sales.length}개 숨김 이벤트</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">숨김 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <AdminSaleCard
              key={sale.id}
              sale={sale}
              actions={["restore", "delete"]}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}