// @ts-nocheck
import { useState } from "react";
import { Sale, platforms } from "@/data/salesUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface AdminEditDialogProps {
  sale: Sale | null;
  onClose: () => void;
  onSubmit: (data: { sale_name: string; platform: string; link: string; start_date: string; end_date: string; event_key: string; image_url: string }) => void;
}

export default function AdminEditDialog({ sale, onClose, onSubmit }: AdminEditDialogProps) {
  const [form, setForm] = useState({
    sale_name: "", platform: "", link: "", start_date: "", end_date: "", event_key: "", image_url: "",
  });

  // Sync form when sale changes
  if (sale && form.sale_name === "" && form.platform === "") {
    setForm({
      sale_name: sale.sale_name,
      platform: sale.platform,
      link: sale.link || "",
      start_date: sale.start_date,
      end_date: sale.end_date,
      event_key: sale.event_key || "",
      image_url: sale.image_url || "",
    });
  }

  const handleClose = () => {
    setForm({ sale_name: "", platform: "", link: "", start_date: "", end_date: "", event_key: "", image_url: "" });
    onClose();
  };

  return (
    <Dialog open={!!sale} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>이벤트 수정</DialogTitle></DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label className="text-sm">제목</Label>
            <Input value={form.sale_name} onChange={(e) => setForm((f) => ({ ...f, sale_name: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">플랫폼</Label>
            <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-sm">링크</Label>
            <Input type="url" placeholder="https://..." value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">시작일</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">종료일</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Event Key</Label>
            <Input placeholder="플랫폼::행사명" value={form.event_key} onChange={(e) => setForm((f) => ({ ...f, event_key: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">이미지 URL</Label>
            <Input type="url" placeholder="https://..." value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
          </div>
          <Button className="w-full" onClick={() => { onSubmit(form); handleClose(); }}>저장</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
