import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp } from "lucide-react";

export default function AdminAnalytics() {
  const { data: signals = [] } = useQuery({
    queryKey: ["analytics_signals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sale_signals").select("platform, source_type, review_status, confidence, created_at").limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ["analytics_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sale_events").select("platform, signal_count, importance_score, event_status, canonical_title, created_at").limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["analytics_sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sales").select("platform, publish_status, review_status, created_at").limit(1000);
      if (error) throw error;
      return data ?? [];
    },
  });

  const count = (arr: any[], key: string) =>
    arr.reduce<Record<string, number>>((acc, item) => {
      const k = item[key] || "unknown";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

  const signalsByPlatform = count(signals, "platform");
  const signalsBySource = count(signals, "source_type");
  const signalsByStatus = count(signals, "review_status");
  const eventsByPlatform = count(events, "platform");
  const salesByPlatform = count(sales.filter(s => s.publish_status === "published"), "platform");

  const promoted = signals.filter(s => s.review_status === "promoted").length;
  const publishedSales = sales.filter(s => s.publish_status === "published").length;

  const topEvents = [...events]
    .sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0))
    .slice(0, 10);

  // Weekly trend
  const weeklySignals = signals.reduce<Record<string, number>>((acc, s) => {
    const d = new Date(s.created_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split("T")[0];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">운영 분석</h3>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="전체 시그널" value={signals.length} />
        <MetricCard label="승격된 시그널" value={promoted} />
        <MetricCard label="이벤트 수" value={events.length} />
        <MetricCard label="게시된 세일" value={publishedSales} />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BarCard title="시그널: 플랫폼별" data={signalsByPlatform} />
        <BarCard title="시그널: 소스별" data={signalsBySource} />
        <BarCard title="시그널: 상태별" data={signalsByStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BarCard title="이벤트: 플랫폼별" data={eventsByPlatform} />
        <BarCard title="게시 세일: 플랫폼별" data={salesByPlatform} />
      </div>

      {/* Weekly trend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          주간 시그널 트렌드
        </p>
        <div className="space-y-1">
          {Object.entries(weeklySignals)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 8)
            .map(([week, cnt]) => (
              <div key={week} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground w-24">{week}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full"
                    style={{ width: `${Math.min((cnt / Math.max(...Object.values(weeklySignals))) * 100, 100)}%` }}
                  />
                </div>
                <span className="font-semibold text-card-foreground w-8 text-right">{cnt}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Top events */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-xs font-semibold text-foreground mb-3">🏆 상위 이벤트 (중요도순)</p>
        <div className="space-y-1.5">
          {topEvents.map((evt, i) => (
            <div key={evt.canonical_title + i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground w-5 text-right">{i + 1}</span>
                <span className="font-medium text-card-foreground truncate">{evt.canonical_title}</span>
                <span className="text-muted-foreground shrink-0">{evt.platform}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-muted-foreground">시그널 {evt.signal_count || 0}</span>
                <span className="font-bold text-primary">점수 {evt.importance_score}</span>
              </div>
            </div>
          ))}
          {topEvents.length === 0 && <p className="text-[11px] text-muted-foreground">데이터 없음</p>}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-center">
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function BarCard({ title, data }: { title: string; data: Record<string, number> }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = sorted.length > 0 ? sorted[0][1] : 1;
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <p className="text-xs font-semibold text-foreground mb-2">{title}</p>
      <div className="space-y-1">
        {sorted.map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground w-20 truncate">{key}</span>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary/50 rounded-full" style={{ width: `${(val / max) * 100}%` }} />
            </div>
            <span className="font-semibold text-card-foreground w-6 text-right">{val}</span>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-[11px] text-muted-foreground">데이터 없음</p>}
      </div>
    </div>
  );
}
