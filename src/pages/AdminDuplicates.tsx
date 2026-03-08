import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Merge, XCircle, Search, ShoppingBag } from "lucide-react";

interface SaleEvent {
  id: string;
  canonical_title: string;
  platform: string;
  canonical_link: string;
  start_date: string;
  end_date: string;
  signal_count: number;
  event_status: string;
}

interface SaleRow {
  id: string;
  sale_name: string;
  platform: string;
  start_date: string;
  end_date: string;
  event_id: string | null;
  link: string;
}

export default function AdminDuplicates() {
  const queryClient = useQueryClient();
  const [dismissedEvents, setDismissedEvents] = useState<Set<string>>(new Set());
  const [dismissedSales, setDismissedSales] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"events" | "sales">("events");

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["duplicate_check_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as SaleEvent[];
    },
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["duplicate_check_sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, sale_name, platform, start_date, end_date, event_id, link")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as SaleRow[];
    },
  });

  const eventDuplicateGroups = useMemo(
    () => findEventDuplicates(events, dismissedEvents),
    [events, dismissedEvents]
  );

  const salesDuplicateGroups = useMemo(
    () => findSalesDuplicates(sales, dismissedSales),
    [sales, dismissedSales]
  );

  const handleMergeEvents = async (group: DuplicateGroup<SaleEvent>) => {
    const primary = group.items[0];
    const others = group.items.slice(1);
    try {
      for (const evt of others) {
        await supabase.from("sales").update({ event_id: primary.id }).eq("event_id", evt.id);
        await supabase.from("sale_events").update({ event_status: "merged", signal_count: 0 }).eq("id", evt.id);
      }
      const totalSignals = group.items.reduce((sum, e) => sum + (e.signal_count || 0), 0);
      await supabase.from("sale_events").update({ signal_count: totalSignals }).eq("id", primary.id);
      toast.success(`${others.length}개 이벤트를 "${primary.canonical_title}"로 병합했습니다.`);
      queryClient.invalidateQueries({ queryKey: ["duplicate_check_events"] });
      queryClient.invalidateQueries({ queryKey: ["duplicate_check_sales"] });
    } catch (err: any) {
      toast.error(err.message || "병합에 실패했습니다.");
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      await supabase.from("sales").delete().eq("id", id);
      toast.success("세일이 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["duplicate_check_sales"] });
    } catch (err: any) {
      toast.error(err.message || "삭제에 실패했습니다.");
    }
  };

  const isLoading = eventsLoading || salesLoading;

  if (isLoading) return <p className="text-sm text-muted-foreground text-center py-12">분석 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Copy className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">중복 감지</h3>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setTab("events")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === "events" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          이벤트 중복 ({eventDuplicateGroups.length})
        </button>
        <button
          onClick={() => setTab("sales")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === "sales" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          <ShoppingBag className="w-3 h-3 inline mr-1" />
          세일 중복 ({salesDuplicateGroups.length})
        </button>
      </div>

      {tab === "events" ? (
        <DuplicateList
          groups={eventDuplicateGroups}
          renderItem={(evt, idx) => {
            const linkedSales = sales.filter(s => s.event_id === evt.id);
            return (
              <div key={evt.id} className={`text-xs p-2 rounded-md ${idx === 0 ? "bg-primary/5 border border-primary/20" : "bg-muted/50"}`}>
                <div className="flex items-center gap-2">
                  {idx === 0 && <Badge className="text-[9px] h-4">기준</Badge>}
                  <span className="font-semibold text-card-foreground">{evt.canonical_title}</span>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  {evt.start_date} ~ {evt.end_date} · 시그널 {evt.signal_count}개 · 세일 {linkedSales.length}개 · {evt.event_status}
                </p>
              </div>
            );
          }}
          onMerge={handleMergeEvents}
          onDismiss={(key) => setDismissedEvents(prev => new Set(prev).add(key))}
          mergeLabel="첫 번째로 병합"
        />
      ) : (
        <DuplicateList
          groups={salesDuplicateGroups}
          renderItem={(sale, idx) => (
            <div key={sale.id} className={`text-xs p-2 rounded-md flex items-center justify-between ${idx === 0 ? "bg-primary/5 border border-primary/20" : "bg-muted/50"}`}>
              <div>
                <div className="flex items-center gap-2">
                  {idx === 0 && <Badge className="text-[9px] h-4">유지</Badge>}
                  <span className="font-semibold text-card-foreground">{sale.sale_name}</span>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  {sale.platform} · {sale.start_date} ~ {sale.end_date}
                </p>
                <p className="text-muted-foreground/60 truncate max-w-xs">{sale.link}</p>
              </div>
              {idx > 0 && (
                <Button size="sm" variant="destructive" className="text-[10px] h-6 px-2" onClick={() => handleDeleteSale(sale.id)}>
                  삭제
                </Button>
              )}
            </div>
          )}
          onDismiss={(key) => setDismissedSales(prev => new Set(prev).add(key))}
        />
      )}
    </div>
  );
}

/* ── Generic duplicate list component ── */
interface DuplicateGroup<T> {
  key: string;
  items: T[];
  reason: string;
}

function DuplicateList<T>({
  groups,
  renderItem,
  onMerge,
  onDismiss,
  mergeLabel,
}: {
  groups: DuplicateGroup<T>[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  onMerge?: (group: DuplicateGroup<T>) => void;
  onDismiss: (key: string) => void;
  mergeLabel?: string;
}) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">중복 후보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.key} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div>
            <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
              {group.reason}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{group.items.length}개 항목</p>
          </div>
          <div className="space-y-1.5">
            {group.items.map((item, idx) => renderItem(item, idx))}
          </div>
          <div className="flex gap-2">
            {onMerge && (
              <Button size="sm" className="gap-1 text-xs h-7" onClick={() => onMerge(group)}>
                <Merge className="w-3 h-3" />{mergeLabel || "병합"}
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onDismiss(group.key)}>
              <XCircle className="w-3 h-3" />무시
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Event duplicate detection ── */
function findEventDuplicates(events: SaleEvent[], dismissed: Set<string>): DuplicateGroup<SaleEvent>[] {
  const groups: DuplicateGroup<SaleEvent>[] = [];
  const checked = new Set<string>();

  for (let i = 0; i < events.length; i++) {
    if (checked.has(events[i].id)) continue;
    const matches: SaleEvent[] = [events[i]];

    for (let j = i + 1; j < events.length; j++) {
      if (checked.has(events[j].id)) continue;
      if (events[i].platform !== events[j].platform) continue;

      const titleA = events[i].canonical_title.toLowerCase().replace(/\s/g, "");
      const titleB = events[j].canonical_title.toLowerCase().replace(/\s/g, "");
      const similar = titleA === titleB || titleA.includes(titleB) || titleB.includes(titleA) || levenshteinRatio(titleA, titleB) > 0.7;
      const dateOverlap = events[i].start_date <= events[j].end_date && events[j].start_date <= events[i].end_date;

      if (similar || (dateOverlap && titleA.length > 3 && levenshteinRatio(titleA, titleB) > 0.5)) {
        matches.push(events[j]);
        checked.add(events[j].id);
      }
    }

    if (matches.length > 1) {
      checked.add(events[i].id);
      const key = matches.map(m => m.id).sort().join("-");
      if (!dismissed.has(key)) {
        groups.push({ key, items: matches, reason: "유사한 제목 / 날짜 겹침" });
      }
    }
  }
  return groups;
}

/* ── Sales duplicate detection ── */
function findSalesDuplicates(sales: SaleRow[], dismissed: Set<string>): DuplicateGroup<SaleRow>[] {
  const groups: DuplicateGroup<SaleRow>[] = [];

  // 1. Exact link duplicates
  const linkMap = new Map<string, SaleRow[]>();
  for (const s of sales) {
    if (!s.link) continue;
    const key = s.link.trim().toLowerCase();
    if (!linkMap.has(key)) linkMap.set(key, []);
    linkMap.get(key)!.push(s);
  }
  for (const [, items] of linkMap) {
    if (items.length > 1) {
      const key = items.map(s => s.id).sort().join("-");
      if (!dismissed.has(key)) {
        groups.push({ key, items, reason: "동일 링크" });
      }
    }
  }

  // 2. Same platform + similar title + overlapping dates
  const usedIds = new Set(groups.flatMap(g => g.items.map(i => i.id)));
  const checked = new Set<string>();

  for (let i = 0; i < sales.length; i++) {
    if (checked.has(sales[i].id) || usedIds.has(sales[i].id)) continue;
    const matches: SaleRow[] = [sales[i]];

    for (let j = i + 1; j < sales.length; j++) {
      if (checked.has(sales[j].id) || usedIds.has(sales[j].id)) continue;
      if (sales[i].platform !== sales[j].platform) continue;

      const titleA = sales[i].sale_name.toLowerCase().replace(/\s/g, "");
      const titleB = sales[j].sale_name.toLowerCase().replace(/\s/g, "");
      const similar = titleA === titleB || titleA.includes(titleB) || titleB.includes(titleA) || levenshteinRatio(titleA, titleB) > 0.7;
      const dateOverlap = sales[i].start_date <= sales[j].end_date && sales[j].start_date <= sales[i].end_date;

      if (similar && dateOverlap) {
        matches.push(sales[j]);
        checked.add(sales[j].id);
      }
    }

    if (matches.length > 1) {
      checked.add(sales[i].id);
      const key = matches.map(m => m.id).sort().join("-");
      if (!dismissed.has(key)) {
        groups.push({ key, items: matches, reason: "유사 제목 + 날짜 겹침" });
      }
    }
  }

  return groups;
}

/* ── Levenshtein utils ── */
function levenshteinRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
