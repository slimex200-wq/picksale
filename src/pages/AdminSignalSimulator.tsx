import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FlaskConical, Send, CheckCircle } from "lucide-react";
import { platforms } from "@/data/salesUtils";

const sourceTypes = ["homepage", "event_hub", "detail", "news", "community"];

export default function AdminSignalSimulator() {
  const [form, setForm] = useState({
    platform: "",
    source_type: "homepage",
    source_url: "",
    raw_title: "",
    raw_text: "",
    detected_keywords: "",
    detected_discount: "",
    start_date_raw: "",
    end_date_raw: "",
    confidence: "70",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform || !form.raw_title) {
      toast.error("플랫폼과 제목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const normalized_title = form.raw_title.toLowerCase().trim();

      // Check alias match
      const { data: alias } = await supabase
        .from("event_aliases")
        .select("canonical_name")
        .eq("platform", form.platform)
        .ilike("alias", normalized_title)
        .limit(1)
        .maybeSingle();

      const matched_alias = alias?.canonical_name || "";

      // Check if matches existing event
      const { data: matchedEvents } = await supabase
        .from("sale_events")
        .select("id, canonical_title, platform, event_status")
        .eq("platform", form.platform)
        .eq("event_status", "active")
        .limit(10);

      const eventMatch = matchedEvents?.find(e =>
        e.canonical_title.toLowerCase().includes(normalized_title) ||
        normalized_title.includes(e.canonical_title.toLowerCase()) ||
        (matched_alias && e.canonical_title.toLowerCase().includes(matched_alias.toLowerCase()))
      );

      const keywords = form.detected_keywords.split(",").map(k => k.trim()).filter(Boolean);
      const confidence = Math.min(parseInt(form.confidence) / 100, 1);

      // Insert signal
      const { data: sig, error } = await supabase.from("sale_signals").insert({
        platform: form.platform,
        source_type: form.source_type,
        source_url: form.source_url || "",
        raw_title: form.raw_title,
        raw_text: form.raw_text || "",
        detected_keywords: keywords,
        detected_discount: form.detected_discount || "",
        start_date_raw: form.start_date_raw || null,
        end_date_raw: form.end_date_raw || null,
        confidence,
        normalized_title,
        matched_alias,
        review_status: "pending",
        processed: false,
      }).select("id").single();

      if (error) throw error;

      setResult({
        signal_id: sig.id,
        normalized_title,
        matched_alias: matched_alias || null,
        matched_event: eventMatch || null,
        confidence,
        would_group: !!eventMatch,
      });

      toast.success("시뮬레이션 시그널이 생성되었습니다.");
    } catch (err: any) {
      toast.error(err.message || "시뮬레이션에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">시그널 시뮬레이터</h3>
      </div>
      <p className="text-xs text-muted-foreground">크롤러 없이 테스트 시그널을 수동으로 생성합니다.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">플랫폼 *</Label>
          <Select value={form.platform} onValueChange={v => update("platform", v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">소스 타입</Label>
          <Select value={form.source_type} onValueChange={v => update("source_type", v)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {sourceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs">제목 *</Label>
          <Input value={form.raw_title} onChange={e => update("raw_title", e.target.value)}
            placeholder="예: Spring Festa 최대 70% 할인" className="h-9 text-xs" />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-xs">내용</Label>
          <Textarea value={form.raw_text} onChange={e => update("raw_text", e.target.value)}
            placeholder="세일 설명..." className="text-xs resize-none" rows={3} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">소스 URL</Label>
          <Input value={form.source_url} onChange={e => update("source_url", e.target.value)}
            placeholder="https://..." className="h-9 text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">할인율</Label>
          <Input value={form.detected_discount} onChange={e => update("detected_discount", e.target.value)}
            placeholder="최대 70%" className="h-9 text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">키워드 (쉼표 구분)</Label>
          <Input value={form.detected_keywords} onChange={e => update("detected_keywords", e.target.value)}
            placeholder="스프링페스타, 할인" className="h-9 text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">신뢰도 (0-100)</Label>
          <Input type="number" value={form.confidence} onChange={e => update("confidence", e.target.value)}
            min="0" max="100" className="h-9 text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">시작일</Label>
          <Input type="date" value={form.start_date_raw} onChange={e => update("start_date_raw", e.target.value)}
            className="h-9 text-xs" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">종료일</Label>
          <Input type="date" value={form.end_date_raw} onChange={e => update("end_date_raw", e.target.value)}
            className="h-9 text-xs" />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" className="w-full gap-1.5 h-9 text-xs" disabled={submitting}>
            <Send className="w-3.5 h-3.5" />
            {submitting ? "생성 중..." : "시뮬레이션 시그널 생성"}
          </Button>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div className="bg-card border border-primary/20 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-600" />
            시뮬레이션 결과
          </p>
          <div className="space-y-1 text-xs">
            <Row label="시그널 ID" value={result.signal_id} />
            <Row label="정규화 제목" value={result.normalized_title} />
            <Row label="매칭 별칭" value={result.matched_alias || "없음"} />
            <Row label="신뢰도" value={`${Math.round(result.confidence * 100)}%`} />
            <Row label="이벤트 매칭" value={
              result.matched_event
                ? `✅ ${result.matched_event.canonical_title} (${result.matched_event.event_status})`
                : "❌ 매칭 없음"
            } />
            <div className="pt-1">
              <Badge variant="outline" className={`text-[10px] ${result.would_group ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                {result.would_group ? "기존 이벤트에 그룹핑 가능" : "새 이벤트 생성 필요"}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-card-foreground font-medium break-all">{value}</span>
    </div>
  );
}
