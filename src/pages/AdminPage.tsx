import { useState } from "react";
import { useSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { platforms, Platform, Sale } from "@/data/salesUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";

interface FormState {
  platform: string;
  sale_name: string;
  start_date: string;
  end_date: string;
  category: string;
  link: string;
  description: string;
}

const emptyForm: FormState = {
  platform: "",
  sale_name: "",
  start_date: "",
  end_date: "",
  category: "",
  link: "",
  description: "",
};

function saleToForm(sale: Sale): FormState {
  return {
    platform: sale.platform,
    sale_name: sale.sale_name,
    start_date: sale.start_date,
    end_date: sale.end_date,
    category: sale.category.join(", "),
    link: sale.link,
    description: sale.description,
  };
}

export default function AdminPage() {
  const { data: sales = [], isLoading } = useSales();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setForm(saleToForm(sale));
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform || !form.sale_name || !form.start_date || !form.end_date) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);
    const categories = form.category
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      platform: form.platform,
      sale_name: form.sale_name,
      start_date: form.start_date,
      end_date: form.end_date,
      category: categories,
      link: form.link || "",
      description: form.description || "",
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("sales")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("세일이 수정되었습니다.");
      } else {
        const { error } = await supabase.from("sales").insert(payload);
        if (error) throw error;
        toast.success("세일이 등록되었습니다.");
      }
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
      toast.success("삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    } catch (err: any) {
      toast.error(err.message || "삭제에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          세일 관리
        </h2>
        <Button size="sm" className="gap-1.5 rounded-md" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          추가
        </Button>
      </div>

      {/* Sales list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">등록된 세일이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground truncate">
                  {sale.sale_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sale.platform} · {sale.start_date} ~ {sale.end_date}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => openEdit(sale)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(sale.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "세일 수정" : "세일 추가"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm">플랫폼 *</Label>
              <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">세일 이름 *</Label>
              <Input
                value={form.sale_name}
                onChange={(e) => update("sale_name", e.target.value)}
                placeholder="예: 올영세일"
                className="rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">시작일 *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => update("start_date", e.target.value)}
                  className="rounded-md"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">종료일 *</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => update("end_date", e.target.value)}
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">카테고리</Label>
              <Input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="뷰티, 패션 (쉼표 구분)"
                className="rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">링크</Label>
              <Input
                value={form.link}
                onChange={(e) => update("link", e.target.value)}
                placeholder="https://..."
                className="rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">설명</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="세일 설명"
                className="rounded-md resize-none"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full rounded-md" disabled={submitting}>
              {submitting ? "저장 중..." : editingId ? "수정하기" : "등록하기"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
