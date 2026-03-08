import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, ArrowLeft, LogIn } from "lucide-react";
import { platforms } from "@/data/salesUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const postCategories = [
  { value: "sale_info", label: "🏷️ 세일 정보", desc: "대형 세일, 기획전, 할인 행사" },
  { value: "hot_deal", label: "🔥 핫딜", desc: "단일 상품 특가, 한정 할인" },
  { value: "shopping_tip", label: "💡 쇼핑 팁", desc: "쿠폰, 카드 혜택, 구매 타이밍" },
];

export default function SubmitSale() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    external_link: "",
    platform: "",
    category: "",
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
        <button onClick={() => navigate("/community")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />목록
        </button>
        <div className="text-center py-16 space-y-4">
          <LogIn className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">게시글을 작성하려면 로그인이 필요합니다.</p>
          <Link to="/login" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
            <LogIn className="w-4 h-4" />로그인하기
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("제목을 입력해주세요."); return; }
    if (!form.category) { toast.error("카테고리를 선택해주세요."); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("community_posts").insert({
        title: form.title.trim(),
        content: form.content.trim() || null,
        external_link: form.external_link.trim() || "",
        platform: form.platform || null,
        category: [form.category],
        review_status: "published",
        author_id: user.id,
        author: profile?.username || "익명",
      });

      if (error) throw error;
      toast.success("게시글이 등록되었습니다! 🎉");
      navigate("/community");
    } catch (err: any) {
      toast.error(err.message || "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      <button onClick={() => navigate("/community")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />목록
      </button>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          세일 발견 공유
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          발견한 세일, 핫딜, 쇼핑 팁을 공유해주세요. 추천을 많이 받으면 자동으로 세일 레이더에 감지됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">카테고리 *</Label>
          <div className="grid grid-cols-1 gap-2">
            {postCategories.map((cat) => (
              <button key={cat.value} type="button" onClick={() => update("category", cat.value)}
                className={`text-left p-3 rounded-xl border transition-all ${form.category === cat.value ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30"}`}>
                <p className="text-sm font-semibold">{cat.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">제목 *</Label>
          <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="예: 올리브영 봄맞이 세일 시작!" className="rounded-xl" maxLength={100} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">내용</Label>
          <Textarea value={form.content} onChange={(e) => update("content", e.target.value)} placeholder="세일 정보, 할인율, 기간, 주의사항 등을 자유롭게 작성해주세요" className="rounded-xl resize-none" rows={4} maxLength={2000} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">링크 (선택)</Label>
          <Input value={form.external_link} onChange={(e) => update("external_link", e.target.value)} placeholder="https://..." className="rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">플랫폼 (선택)</Label>
          <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="관련 플랫폼 선택" /></SelectTrigger>
            <SelectContent>
              {platforms.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full rounded-xl gap-2 h-11" disabled={submitting}>
          <Send className="w-4 h-4" />
          {submitting ? "등록 중..." : "공유하기"}
        </Button>
      </form>
    </div>
  );
}
