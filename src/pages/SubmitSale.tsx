import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { platforms } from "@/data/salesUtils";
import { supabase } from "@/integrations/supabase/client";

export default function SubmitSale() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    platform: "",
    sale_name: "",
    link: "",
    start_date: "",
    end_date: "",
    category: "",
    description: "",
    submitter_email: "",
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sale_name || !form.link) {
      toast.error("세일 이름과 링크는 필수입니다.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("sale_submissions").insert({
        platform: form.platform || null,
        sale_name: form.sale_name,
        link: form.link,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        category: form.category || null,
        description: form.description || null,
        submitter_email: form.submitter_email || null,
      });

      if (error) throw error;

      toast.success("세일 제보가 접수되었습니다! 관리자 승인 후 공개됩니다. 🎉");
      setForm({
        platform: "",
        sale_name: "",
        link: "",
        start_date: "",
        end_date: "",
        category: "",
        description: "",
        submitter_email: "",
      });
    } catch (err: any) {
      toast.error(err.message || "제보에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          세일 제보하기
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          새로운 세일을 발견하셨나요? 제보해주시면 관리자 승인 후 공개됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">플랫폼</Label>
          <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
            <SelectTrigger className="rounded-md">
              <SelectValue placeholder="플랫폼 선택" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">세일 이름 *</Label>
          <Input
            value={form.sale_name}
            onChange={(e) => update("sale_name", e.target.value)}
            placeholder="예: 올영세일"
            className="rounded-md"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">세일 링크 *</Label>
          <Input
            value={form.link}
            onChange={(e) => update("link", e.target.value)}
            placeholder="https://..."
            className="rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">시작일</Label>
            <Input
              type="date"
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
              className="rounded-md"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">종료일</Label>
            <Input
              type="date"
              value={form.end_date}
              onChange={(e) => update("end_date", e.target.value)}
              className="rounded-md"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">카테고리</Label>
          <Input
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            placeholder="예: 뷰티, 패션"
            className="rounded-md"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">설명</Label>
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="세일에 대한 간단한 설명"
            className="rounded-md resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">이메일 (선택)</Label>
          <Input
            type="email"
            value={form.submitter_email}
            onChange={(e) => update("submitter_email", e.target.value)}
            placeholder="승인 알림을 받을 이메일"
            className="rounded-md"
          />
        </div>

        <Button type="submit" className="w-full rounded-md gap-2" disabled={submitting}>
          <Send className="w-4 h-4" />
          {submitting ? "제보 중..." : "제보하기"}
        </Button>
      </form>
    </div>
  );
}
