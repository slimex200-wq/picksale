// @ts-nocheck
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sale, platforms, getTodayKST } from "@/data/salesUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, Download, ExternalLink, RotateCcw } from "lucide-react";

export default function AdminHidden() {
  const queryClient = useQueryClient();
  const today = getTodayKST();
  const currentYear = parseInt(today.slice(0, 4));
  const currentMonth = parseInt(today.slice(5, 7));

  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [monthFilter, setMonthFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales", "admin-hidden", yearFilter, monthFilter, platformFilter],
    queryFn: async (): Promise<Sale[]> => {
      // Fetch hidden OR expired sales
      let q = supabase.from("sales").select("*");

      // We need: publish_status = 'hidden' OR end_date < today
      // Use .or() filter
      q = q.or(`publish_status.eq.hidden,end_date.lt.${today}`);

      if (platformFilter && platformFilter !== "all") {
        q = q.eq("platform", platformFilter);
      }

      if (yearFilter && yearFilter !== "all") {
        const y = parseInt(yearFilter);
        if (monthFilter && monthFilter !== "all") {
          const m = parseInt(monthFilter);
          const start = `${y}-${String(m).padStart(2, "0")}-01`;
          const endMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
          q = q.gte("end_date", start).lt("end_date", endMonth);
        } else {
          q = q.gte("end_date", `${y}-01-01`).lt("end_date", `${y + 1}-01-01`);
        }
      }

      q = q.order("end_date", { ascending: false });

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        platform: row.platform,
        sale_name: row.sale_name,
        start_date: row.start_date,
        end_date: row.end_date,
        category: row.category ?? [],
        link: row.link ?? "",
        description: row.description ?? "",
        sale_tier: row.sale_tier ?? "major",
        importance_score: row.importance_score ?? 0,
        filter_reason: row.filter_reason ?? "",
        review_status: row.review_status ?? "pending",
        publish_status: row.publish_status ?? "draft",
        source_urls: row.source_urls ?? [],
        grouped_page_count: row.grouped_page_count ?? 0,
        image_url: row.image_url ?? "",
        event_id: row.event_id ?? null,
        signal_id: row.signal_id ?? null,
        created_at: row.created_at,
      }));
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sales"] });

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from("sales").update({ publish_status: "published" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("게시 상태로 복원되었습니다.");
    invalidate();
  };

  const handleCSVDownload = () => {
    if (sales.length === 0) { toast.error("다운로드할 데이터가 없습니다."); return; }
    const headers = ["제목", "플랫폼", "시작일", "종료일", "게시상태", "링크"];
    const rows = sales.map(s => [
      `"${s.sale_name.replace(/"/g, '""')}"`,
      s.platform,
      s.start_date,
      s.end_date,
      s.publish_status,
      s.link,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hidden-sales-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV 다운로드 완료");
  };

  const years = Array.from({ length: 3 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));

  const reasonLabel = (sale: Sale) => {
    if (sale.publish_status === "hidden") return "숨김 처리";
    if (sale.end_date < today) return "기간 만료";
    return "";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
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

      <p className="text-xs text-muted-foreground">{sales.length}개 숨김/만료 이벤트</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">숨김/만료 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
                      {reasonLabel(sale)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {sale.platform}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{sale.sale_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {sale.start_date} ~ {sale.end_date}
                  </p>
                </div>
                {sale.link && (
                  <a href={sale.link} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>
              <div className="flex gap-1.5 pt-1">
                <Button size="sm" className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                  onClick={() => handleRestore(sale.id)}>
                  <RotateCcw className="w-3 h-3" /> 복원 (게시)
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
