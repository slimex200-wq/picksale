import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Radio, CheckCircle, XCircle, Clock, AlertTriangle,
} from "lucide-react";

export default function AdminSignalDebug() {
  const { data: signals = [], isLoading } = useQuery({
    queryKey: ["signal_debug_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_signals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const byPlatform = signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.platform] = (acc[s.platform] || 0) + 1;
    return acc;
  }, {});

  const bySource = signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.source_type] = (acc[s.source_type] || 0) + 1;
    return acc;
  }, {});

  const byStatus = signals.reduce<Record<string, number>>((acc, s) => {
    acc[s.review_status] = (acc[s.review_status] || 0) + 1;
    return acc;
  }, {});

  const processed = signals.filter(s => s.processed).length;
  const unprocessed = signals.filter(s => !s.processed).length;
  const lowConf = signals.filter(s => s.confidence < 0.3).length;

  if (isLoading) return <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Radio className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">시그널 디버그</h3>
        <span className="text-xs text-muted-foreground">최근 100개</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="전체" value={signals.length} icon={Radio} />
        <SummaryCard label="처리됨" value={processed} icon={CheckCircle} color="text-green-600" />
        <SummaryCard label="미처리" value={unprocessed} icon={Clock} color="text-yellow-600" />
        <SummaryCard label="낮은 신뢰도" value={lowConf} icon={AlertTriangle} color="text-destructive" />
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BreakdownCard title="플랫폼별" data={byPlatform} />
        <BreakdownCard title="소스별" data={bySource} />
        <BreakdownCard title="상태별" data={byStatus} />
      </div>

      {/* Signal list */}
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-foreground">시그널 목록</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 px-2">플랫폼</th>
                <th className="text-left py-2 px-2">소스</th>
                <th className="text-left py-2 px-2">제목</th>
                <th className="text-left py-2 px-2">정규화</th>
                <th className="text-left py-2 px-2">신뢰도</th>
                <th className="text-left py-2 px-2">상태</th>
                <th className="text-left py-2 px-2">처리</th>
                <th className="text-left py-2 px-2">생성일</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((sig) => (
                <tr key={sig.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-1.5 px-2 font-medium">{sig.platform}</td>
                  <td className="py-1.5 px-2">
                    <Badge variant="outline" className="text-[9px]">{sig.source_type}</Badge>
                  </td>
                  <td className="py-1.5 px-2 max-w-[200px] truncate">{sig.raw_title}</td>
                  <td className="py-1.5 px-2 max-w-[150px] truncate text-muted-foreground">
                    {sig.normalized_title || "-"}
                  </td>
                  <td className="py-1.5 px-2">
                    <span className={`font-semibold ${sig.confidence >= 0.7 ? "text-green-600" : sig.confidence >= 0.4 ? "text-yellow-600" : "text-destructive"}`}>
                      {Math.round(sig.confidence * 100)}%
                    </span>
                  </td>
                  <td className="py-1.5 px-2">
                    <Badge variant="outline" className={`text-[9px] ${
                      sig.review_status === "promoted" ? "bg-green-50 text-green-700" :
                      sig.review_status === "dismissed" ? "bg-muted text-muted-foreground" :
                      "bg-yellow-50 text-yellow-700"
                    }`}>{sig.review_status}</Badge>
                  </td>
                  <td className="py-1.5 px-2">
                    {sig.processed ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                  </td>
                  <td className="py-1.5 px-2 text-muted-foreground whitespace-nowrap">
                    {new Date(sig.created_at).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, color = "text-primary" }: {
  label: string; value: number; icon: any; color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
      <Icon className={`w-6 h-6 ${color}`} />
      <div>
        <p className="text-xl font-bold text-card-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <p className="text-xs font-semibold text-foreground mb-2">{title}</p>
      <div className="space-y-1">
        {sorted.map(([key, val]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{key}</span>
            <span className="font-semibold text-card-foreground">{val}</span>
          </div>
        ))}
        {sorted.length === 0 && <p className="text-[11px] text-muted-foreground">데이터 없음</p>}
      </div>
    </div>
  );
}
