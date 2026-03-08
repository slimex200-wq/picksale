import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Merge, XCircle, Search } from "lucide-react";

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

export default function AdminDuplicates() {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data: events = [], isLoading } = useQuery({
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

  const { data: sales = [] } = useQuery({
    queryKey: ["duplicate_check_sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, sale_name, platform, start_date, end_date, event_id, link")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Find duplicate candidate groups
  const duplicateGroups = useMemo(() => {
    const groups: { key: string; events: SaleEvent[]; reason: string }[] = [];
    const checked = new Set<string>();

    for (let i = 0; i < events.length; i++) {
      if (checked.has(events[i].id)) continue;
      const matches: SaleEvent[] = [events[i]];

      for (let j = i + 1; j < events.length; j++) {
        if (checked.has(events[j].id)) continue;
        if (events[i].platform !== events[j].platform) continue;

        const titleA = events[i].canonical_title.toLowerCase().replace(/\s/g, "");
        const titleB = events[j].canonical_title.toLowerCase().replace(/\s/g, "");

        // Similar title check
        const similar = titleA === titleB ||
          titleA.includes(titleB) || titleB.includes(titleA) ||
          levenshteinRatio(titleA, titleB) > 0.7;

        // Date overlap check
        const dateOverlap = events[i].start_date <= events[j].end_date &&
          events[j].start_date <= events[i].end_date;

        if (similar || (dateOverlap && titleA.length > 3 && levenshteinRatio(titleA, titleB) > 0.5)) {
          matches.push(events[j]);
          checked.add(events[j].id);
        }
      }

      if (matches.length > 1) {
        checked.add(events[i].id);
        const key = matches.map(m => m.id).sort().join("-");
        if (!dismissed.has(key)) {
          groups.push({
            key,
            events: matches,
            reason: "유사한 제목 / 날짜 겹침",
          });
        }
      }
    }
    return groups;
  }, [events, dismissed]);

  const handleMerge = async (group: typeof duplicateGroups[0]) => {
    const primary = group.events[0]; // Keep first
    const others = group.events.slice(1);

    try {
      // Reassign sales from others to primary
      for (const evt of others) {
        await supabase
          .from("sales")
          .update({ event_id: primary.id })
          .eq("event_id", evt.id);

        // Update signal_count
        await supabase
          .from("sale_events")
          .update({ event_status: "merged", signal_count: 0 })
          .eq("id", evt.id);
      }

      // Update primary signal_count
      const totalSignals = group.events.reduce((sum, e) => sum + (e.signal_count || 0), 0);
      await supabase
        .from("sale_events")
        .update({ signal_count: totalSignals })
        .eq("id", primary.id);

      toast.success(`${others.length}개 이벤트를 "${primary.canonical_title}"로 병합했습니다.`);
      queryClient.invalidateQueries({ queryKey: ["duplicate_check_events"] });
      queryClient.invalidateQueries({ queryKey: ["duplicate_check_sales"] });
    } catch (err: any) {
      toast.error(err.message || "병합에 실패했습니다.");
    }
  };

  const handleDismiss = (key: string) => {
    setDismissed(prev => new Set(prev).add(key));
  };

  if (isLoading) return <p className="text-sm text-muted-foreground text-center py-12">분석 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Copy className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">중복 감지</h3>
        <span className="text-xs text-muted-foreground">{duplicateGroups.length}개 후보 그룹</span>
      </div>

      {duplicateGroups.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">중복 후보가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map((group) => (
            <div key={group.key} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">
                    {group.reason}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {group.events.length}개 이벤트 · {group.events[0].platform}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                {group.events.map((evt, idx) => {
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
                })}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="gap-1 text-xs h-7" onClick={() => handleMerge(group)}>
                  <Merge className="w-3 h-3" />첫 번째로 병합
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleDismiss(group.key)}>
                  <XCircle className="w-3 h-3" />무시
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple Levenshtein distance ratio
function levenshteinRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
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
