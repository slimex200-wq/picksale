import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, ExternalLink, ArrowUpDown, Layers, ArrowRight,
} from "lucide-react";
import { platforms } from "@/data/salesUtils";

interface SaleSignal {
  id: string;
  platform: string;
  source_type: string;
  source_url: string;
  raw_title: string;
  raw_text: string;
  detected_keywords: string[];
  detected_discount: string;
  start_date_raw: string | null;
  end_date_raw: string | null;
  confidence: number;
  review_status: string;
  processed: boolean;
  created_at: string;
}

const sourceTypeLabels: Record<string, string> = {
  homepage: "홈페이지",
  event_hub: "이벤트 허브",
  detail: "상세 페이지",
  news: "뉴스",
  community: "커뮤니티",
};

export default function AdminSignals() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "confidence">("newest");

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ["sale_signals", platformFilter, sourceFilter, sortBy],
    queryFn: async (): Promise<SaleSignal[]> => {
      let q = supabase
        .from("sale_signals")
        .select("*")
        .eq("review_status", "pending");

      if (platformFilter && platformFilter !== "all") q = q.eq("platform", platformFilter);
      if (sourceFilter && sourceFilter !== "all") q = q.eq("source_type", sourceFilter);

      if (sortBy === "confidence") {
        q = q.order("confidence", { ascending: false });
      } else {
        q = q.order("created_at", { ascending: false });
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as SaleSignal[];
    },
  });

  /** Promote signal → create sale_event + sale entry, link them */
  const handlePromoteToEvent = async (signal: SaleSignal) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      const startDate = signal.start_date_raw || today;
      const finalEndDate = signal.end_date_raw || endDate;

      // 1. Create sale_event
      const { data: eventData, error: eventError } = await supabase
        .from("sale_events")
        .insert({
          canonical_title: signal.raw_title,
          platform: signal.platform,
          canonical_link: signal.source_url,
          start_date: startDate,
          end_date: finalEndDate,
          importance_score: Math.round(signal.confidence * 10),
          event_status: "active",
        })
        .select("id")
        .single();
      if (eventError) throw eventError;

      // 2. Create sale linked to event
      const { error: saleError } = await supabase.from("sales").insert({
        platform: signal.platform || "커뮤니티 핫딜",
        sale_name: signal.raw_title,
        start_date: startDate,
        end_date: finalEndDate,
        link: signal.source_url,
        description: signal.raw_text.slice(0, 500),
        review_status: "approved",
        publish_status: "draft",
        event_id: eventData.id,
        signal_id: signal.id,
      });
      if (saleError) throw saleError;

      // 3. Mark signal as promoted
      const { error: updateError } = await supabase
        .from("sale_signals")
        .update({ review_status: "promoted", processed: true })
        .eq("id", signal.id);
      if (updateError) throw updateError;

      toast.success("이벤트로 승격되었습니다.");
      invalidateAll();
    } catch (err: any) {
      toast.error(err.message || "승격에 실패했습니다.");
    }
  };

  /** Quick promote: signal → sale (no event grouping) */
  const handlePromoteDirect = async (signal: SaleSignal) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

      const { error: insertError } = await supabase.from("sales").insert({
        platform: signal.platform || "커뮤니티 핫딜",
        sale_name: signal.raw_title,
        start_date: signal.start_date_raw || today,
        end_date: signal.end_date_raw || endDate,
        link: signal.source_url,
        description: signal.raw_text.slice(0, 500),
        review_status: "approved",
        publish_status: "draft",
        signal_id: signal.id,
      });
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("sale_signals")
        .update({ review_status: "promoted", processed: true })
        .eq("id", signal.id);
      if (updateError) throw updateError;

      toast.success("세일로 승격되었습니다.");
      invalidateAll();
    } catch (err: any) {
      toast.error(err.message || "승격에 실패했습니다.");
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sale_signals")
        .update({ review_status: "dismissed", processed: true })
        .eq("id", id);
      if (error) throw error;
      toast.success("시그널이 무시되었습니다.");
      invalidateAll();
    } catch (err: any) {
      toast.error(err.message || "처리에 실패했습니다.");
    }
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["sale_signals"] });
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["sale_events"] });
  };

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return "bg-green-100 text-green-700 border-green-300";
    if (c >= 0.5) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{signals.length}개 대기 중</p>

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
          <Label className="text-xs">소스</Label>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="전체" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="homepage">홈페이지</SelectItem>
              <SelectItem value="event_hub">이벤트 허브</SelectItem>
              <SelectItem value="detail">상세</SelectItem>
              <SelectItem value="news">뉴스</SelectItem>
              <SelectItem value="community">커뮤니티</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1 text-xs"
          onClick={() => setSortBy(sortBy === "newest" ? "confidence" : "newest")}>
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === "newest" ? "최신순" : "신뢰도순"}
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : signals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">대기 중인 시그널이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {signals.map((sig) => (
            <SignalCard
              key={sig.id}
              signal={sig}
              confidenceColor={confidenceColor}
              onPromoteToEvent={handlePromoteToEvent}
              onPromoteDirect={handlePromoteDirect}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SignalCard({
  signal: sig,
  confidenceColor,
  onPromoteToEvent,
  onPromoteDirect,
  onDismiss,
}: {
  signal: SaleSignal;
  confidenceColor: (c: number) => string;
  onPromoteToEvent: (s: SaleSignal) => void;
  onPromoteDirect: (s: SaleSignal) => void;
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <Badge variant="outline" className="text-[10px]">
              {sourceTypeLabels[sig.source_type] || sig.source_type}
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${confidenceColor(sig.confidence)}`}>
              신뢰도: {Math.round(sig.confidence * 100)}%
            </Badge>
            {sig.detected_discount && (
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                {sig.detected_discount}
              </Badge>
            )}
          </div>
          <p className="text-sm font-semibold text-card-foreground">{sig.raw_title || "(제목 없음)"}</p>
          <p className="text-xs text-muted-foreground">
            {sig.platform} · {new Date(sig.created_at).toLocaleDateString("ko-KR")}
          </p>
          {sig.start_date_raw && sig.end_date_raw && (
            <p className="text-xs text-muted-foreground">{sig.start_date_raw} ~ {sig.end_date_raw}</p>
          )}
        </div>
        {sig.source_url && (
          <a href={sig.source_url} target="_blank" rel="noopener noreferrer"
            className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        )}
      </div>

      {sig.raw_text && (
        <p className="text-xs text-muted-foreground line-clamp-2">{sig.raw_text}</p>
      )}

      {sig.detected_keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {sig.detected_keywords.slice(0, 5).map((kw, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">
              {kw}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 pt-1 flex-wrap">
        <Button size="sm" className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700" onClick={() => onPromoteToEvent(sig)}>
          <Layers className="w-3 h-3" />이벤트로 승격
        </Button>
        <Button size="sm" className="gap-1 text-xs h-7" onClick={() => onPromoteDirect(sig)}>
          <ArrowRight className="w-3 h-3" />세일로 승격
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onDismiss(sig.id)}>
          <XCircle className="w-3 h-3" />무시
        </Button>
      </div>
    </div>
  );
}
