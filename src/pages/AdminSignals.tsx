// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  XCircle, ExternalLink, ArrowUpDown, Layers, ArrowRight, MessageSquare, Link2, Calendar,
} from "lucide-react";
import { platforms } from "@/data/salesUtils";

function detectDatePattern(start: string | null, end: string | null): string {
  if (!start && !end) return "없음";
  const check = (d: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return "YYYY-MM-DD";
    if (/^\d{2}\.\d{2}$/.test(d)) return "MM.DD";
    if (/^\d{1,2}\/\d{1,2}$/.test(d)) return "M/D";
    if (/^\d{1,2}월\s?\d{1,2}일/.test(d)) return "M월D일";
    if (/\d{4}\.\d{1,2}\.\d{1,2}/.test(d)) return "YYYY.M.D";
    if (/\d{1,2}\.\d{1,2}\.\d{1,2}/.test(d)) return "YY.M.D";
    return d.length > 10 ? "복합" : "기타";
  };
  const patterns = [start, end].filter(Boolean).map(d => check(d!));
  return [...new Set(patterns)].join(" / ");
}

interface SaleSignal {
  id: string;
  platform: string;
  source_type: string;
  source_url: string;
  raw_title: string;
  raw_text: string;
  normalized_title: string;
  matched_alias: string;
  community_post_id: string | null;
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

const confidenceTiers: Record<string, { label: string; base: number }> = {
  detail: { label: "상세", base: 0.9 },
  event_hub: { label: "이벤트 허브", base: 0.8 },
  homepage: { label: "홈페이지", base: 0.7 },
  news: { label: "뉴스", base: 0.5 },
  community: { label: "커뮤니티", base: 0.4 },
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

  // Fetch potential event matches for alias matching
  const { data: events = [] } = useQuery({
    queryKey: ["sale_events_for_match"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_events")
        .select("id, canonical_title, platform, event_status")
        .eq("event_status", "active")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const findMatchedEvent = (sig: SaleSignal) => {
    if (sig.matched_alias) {
      return events.find(e =>
        e.platform === sig.platform &&
        e.canonical_title.toLowerCase().includes(sig.matched_alias.toLowerCase())
      );
    }
    if (sig.normalized_title) {
      return events.find(e =>
        e.platform === sig.platform &&
        e.canonical_title.toLowerCase().includes(sig.normalized_title)
      );
    }
    return null;
  };

  const handlePromoteToEvent = async (signal: SaleSignal) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
      const startDate = signal.start_date_raw || today;
      const finalEndDate = signal.end_date_raw || endDate;

      const matchedEvent = findMatchedEvent(signal);

      if (matchedEvent) {
        // Attach to existing event
        const { error: saleError } = await supabase.from("sales").insert({
          platform: signal.platform || "커뮤니티",
          sale_name: signal.raw_title,
          start_date: startDate,
          end_date: finalEndDate,
          link: signal.source_url,
          description: signal.raw_text.slice(0, 500),
          review_status: "approved",
          publish_status: "draft",
          event_id: matchedEvent.id,
          signal_id: signal.id,
        });
        if (saleError) throw saleError;

        // Increment signal_count manually
        const { data: evRow } = await supabase.from("sale_events").select("signal_count").eq("id", matchedEvent.id).single();
        await supabase.from("sale_events").update({
          signal_count: ((evRow as any)?.signal_count ?? 0) + 1
        }).eq("id", matchedEvent.id);
      } else {
        // Create new event
        const { data: eventData, error: eventError } = await supabase
          .from("sale_events")
          .insert({
            canonical_title: signal.matched_alias || signal.raw_title,
            platform: signal.platform,
            canonical_link: signal.source_url,
            start_date: startDate,
            end_date: finalEndDate,
            importance_score: Math.round(signal.confidence * 10),
            event_status: "active",
            signal_count: 1,
          })
          .select("id")
          .single();
        if (eventError) throw eventError;

        const { error: saleError } = await supabase.from("sales").insert({
          platform: signal.platform || "커뮤니티",
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
      }

      await supabase
        .from("sale_signals")
        .update({ review_status: "promoted", processed: true })
        .eq("id", signal.id);

      toast.success(matchedEvent ? "기존 이벤트에 연결했습니다." : "새 이벤트로 승격되었습니다.");
      invalidateAll();
    } catch (err: any) {
      toast.error(err.message || "승격에 실패했습니다.");
    }
  };

  const handlePromoteDirect = async (signal: SaleSignal) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

      const { error: insertError } = await supabase.from("sales").insert({
        platform: signal.platform || "커뮤니티",
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

      await supabase
        .from("sale_signals")
        .update({ review_status: "promoted", processed: true })
        .eq("id", signal.id);

      toast.success("세일로 승격되었습니다.");
      invalidateAll();
    } catch (err: any) {
      toast.error(err.message || "승격에 실패했습니다.");
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await supabase
        .from("sale_signals")
        .update({ review_status: "dismissed", processed: true })
        .eq("id", id);
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
    queryClient.invalidateQueries({ queryKey: ["sale_events_for_match"] });
  };

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return "bg-green-100 text-green-700 border-green-300";
    if (c >= 0.5) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {/* Confidence scoring reference */}
      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground bg-muted/50 rounded-lg p-2">
        <span className="font-semibold">신뢰도 기준:</span>
        {Object.entries(confidenceTiers).map(([k, v]) => (
          <span key={k}>{v.label} {Math.round(v.base * 100)}%</span>
        ))}
      </div>

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
          {signals.map((sig) => {
            const matchedEvent = findMatchedEvent(sig);
            return (
              <SignalCard
                key={sig.id}
                signal={sig}
                matchedEvent={matchedEvent}
                confidenceColor={confidenceColor}
                onPromoteToEvent={handlePromoteToEvent}
                onPromoteDirect={handlePromoteDirect}
                onDismiss={handleDismiss}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SignalCard({
  signal: sig,
  matchedEvent,
  confidenceColor,
  onPromoteToEvent,
  onPromoteDirect,
  onDismiss,
}: {
  signal: SaleSignal;
  matchedEvent: { id: string; canonical_title: string; platform: string } | null | undefined;
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
            {sig.community_post_id && (
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-200 gap-0.5">
                <MessageSquare className="w-2.5 h-2.5" />커뮤니티
              </Badge>
            )}
          </div>

          {/* Raw title */}
          <p className="text-sm font-semibold text-card-foreground">{sig.raw_title || "(제목 없음)"}</p>

          {/* Normalized title & alias */}
          {sig.normalized_title && sig.normalized_title !== sig.raw_title?.toLowerCase().trim() && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              정규화: <span className="font-medium text-foreground">{sig.normalized_title}</span>
            </p>
          )}
          {sig.matched_alias && (
            <p className="text-[11px] text-muted-foreground">
              매칭 별칭: <span className="font-medium text-primary">{sig.matched_alias}</span>
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-0.5">
369:             {sig.platform} · {new Date(sig.created_at).toLocaleDateString("ko-KR")}
370:           </p>

          {/* Date extraction details */}
          <div className="mt-1.5 p-2 bg-muted/40 rounded-md space-y-1 border border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" />날짜 추출 정보
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
              <span className="text-muted-foreground">시작일 (파싱):</span>
              <span className={`font-medium ${sig.start_date_raw ? 'text-foreground' : 'text-destructive/60'}`}>
                {sig.start_date_raw || "미감지"}
              </span>
              <span className="text-muted-foreground">종료일 (파싱):</span>
              <span className={`font-medium ${sig.end_date_raw ? 'text-foreground' : 'text-destructive/60'}`}>
                {sig.end_date_raw || "미감지"}
              </span>
              <span className="text-muted-foreground">날짜 신뢰도:</span>
              <span className={`font-medium ${
                sig.start_date_raw && sig.end_date_raw ? 'text-green-600' :
                sig.start_date_raw || sig.end_date_raw ? 'text-yellow-600' : 'text-destructive'
              }`}>
                {sig.start_date_raw && sig.end_date_raw ? '✅ 양호 (시작+종료)' :
                 sig.start_date_raw ? '⚠️ 시작일만' :
                 sig.end_date_raw ? '⚠️ 종료일만' : '❌ 미감지'}
              </span>
              <span className="text-muted-foreground">파싱 패턴:</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {detectDatePattern(sig.start_date_raw, sig.end_date_raw)}
              </span>
            </div>
            {/* Show raw text excerpt for date context */}
            {sig.raw_text && (
              <details className="mt-1">
                <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                  원본 텍스트에서 날짜 확인 ▸
                </summary>
                <p className="text-[10px] text-muted-foreground mt-1 bg-background p-1.5 rounded border border-border max-h-20 overflow-y-auto whitespace-pre-wrap">
                  {sig.raw_text.slice(0, 300)}
                </p>
              </details>
            )}
          </div>

          {/* Matched event candidate */}
          {matchedEvent && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md w-fit">
              <Link2 className="w-3 h-3" />
              매칭 이벤트: <span className="font-semibold">{matchedEvent.canonical_title}</span>
            </div>
          )}

          {/* Linked community post */}
          {sig.community_post_id && (
            <a
              href={`/community/${sig.community_post_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
            >
              <MessageSquare className="w-3 h-3" />원본 커뮤니티 게시글 보기
            </a>
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
          <Layers className="w-3 h-3" />
          {matchedEvent ? "이벤트에 연결" : "이벤트로 승격"}
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
