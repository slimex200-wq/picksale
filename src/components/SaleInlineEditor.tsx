import { useState } from "react";
import { Sale, Platform, platforms } from "@/data/salesUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Check, X, CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  sale: Sale;
  onSaved: (updated: Sale) => void;
  onCancel: () => void;
}

export default function SaleInlineEditor({ sale, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(sale.sale_name);
  const [link, setLink] = useState(sale.link);
  const [startDate, setStartDate] = useState<Date>(new Date(sale.start_date));
  const [endDate, setEndDate] = useState<Date>(new Date(sale.end_date));
  const [platform, setPlatform] = useState<Platform>(sale.platform);
  const [description, setDescription] = useState(sale.description || "");
  const [saving, setSaving] = useState(false);

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("제목을 입력해주세요."); return; }
    if (link && !isValidUrl(link)) { toast.error("올바른 URL을 입력해주세요."); return; }
    if (startDate > endDate) { toast.error("시작일이 종료일보다 늦을 수 없습니다."); return; }

    setSaving(true);
    const fmtDate = (d: Date) => d.toISOString().split("T")[0];

    const { error } = await supabase
      .from("sales")
      .update({
        sale_name: title.trim(),
        link: link.trim(),
        start_date: fmtDate(startDate),
        end_date: fmtDate(endDate),
        platform,
        description: description.trim(),
      })
      .eq("id", sale.id);

    setSaving(false);

    if (error) {
      toast.error("저장에 실패했습니다.");
      console.error(error);
      return;
    }

    toast.success("세일 정보가 수정되었습니다.");
    onSaved({
      ...sale,
      sale_name: title.trim(),
      link: link.trim(),
      start_date: fmtDate(startDate),
      end_date: fmtDate(endDate),
      platform,
      description: description.trim(),
    });
  };

  return (
    <div className="space-y-3 p-4 bg-accent/30 rounded-xl border-2 border-primary/30">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-primary">편집 모드</span>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onCancel} disabled={saving}>
            <X className="w-4 h-4" />
          </Button>
          <Button size="sm" className="h-7 px-3 gap-1 text-xs" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            저장
          </Button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-[11px] font-medium text-muted-foreground mb-1 block">제목</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} className="h-9 text-sm" />
      </div>

      {/* Link */}
      <div>
        <label className="text-[11px] font-medium text-muted-foreground mb-1 block">링크 URL</label>
        <Input
          value={link}
          onChange={e => setLink(e.target.value)}
          type="url"
          placeholder="https://..."
          className={cn("h-9 text-sm", link && !isValidUrl(link) && "border-destructive")}
        />
      </div>

      {/* Platform */}
      <div>
        <label className="text-[11px] font-medium text-muted-foreground mb-1 block">플랫폼</label>
        <Select value={platform} onValueChange={v => setPlatform(v as Platform)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {platforms.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">시작일</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-9 text-xs justify-start font-normal">
                <CalendarIcon className="w-3 h-3 mr-1.5" />
                {format(startDate, "yyyy-MM-dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={d => d && setStartDate(d)} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-[11px] font-medium text-muted-foreground mb-1 block">종료일</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-9 text-xs justify-start font-normal">
                <CalendarIcon className="w-3 h-3 mr-1.5" />
                {format(endDate, "yyyy-MM-dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={d => d && setEndDate(d)} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-medium text-muted-foreground mb-1 block">설명</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );
}
