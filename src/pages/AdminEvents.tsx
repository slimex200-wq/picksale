import { useState } from "react";
import { useAdminSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sale, platforms } from "@/data/salesUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [reviewFilter, setReviewFilter] = useState("");
  const [publishFilter, setPublishFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "importance">("newest");

  const { data: sales = [], isLoading } = useAdminSales({
    platform: platformFilter || undefined,
    sale_tier: tierFilter || undefined,
    review_status: reviewFilter || undefined,
    publish_status: publishFilter || undefined,
    sort: sortBy,
  });

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState({
    sale_name: "",
    platform: "",
    start_date: "",
    end_date: "",
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["sales"] });

  const handleStatusUpdate = async (id: string, updates: Record<string, string>) => {
    const { error } = await supabase.from("sales").update(updates).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    invalidate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { data, error } = await supabase.from("sales").delete().eq("id", id).select("id");
    if (error) { toast.error(error.message); return; }
    if (!data || data.length === 0) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    invalidate();
  };

  const openEdit = (sale: Sale) => {
    setEditingSale(sale);
    setEditForm({
      sale_name: sale.sale_name,
      platform: sale.platform,
      start_date: sale.start_date,
      end_date: sale.end_date,
    });
  };

  const handleEditSubmit = async () => {
    if (!editingSale) return;
    const { error } = await supabase
      .from("sales")
      .update({
        sale_name: editForm.sale_name,
        platform: editForm.platform,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
      })
      .eq("id", editingSale.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    setEditingSale(null);
    invalidate();
  };

  const reviewIcon = (s: string) => {
    if (s === "approved") return <CheckCircle className="w-3 h-3 text-green-600" />;
    if (s === "rejected") return <XCircle className="w-3 h-3 text-destructive" />;
    return <Clock className="w-3 h-3 text-yellow-600" />;
  };

  const publishBadge = (s: string) => {
    if (s === "published") return "bg-green-100 text-green-700 border-green-300";
    if (s === "hidden") return "bg-muted text-muted-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Platform</Label>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Tier</Label>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="excluded">Excluded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Review</Label>
          <Select value={reviewFilter} onValueChange={setReviewFilter}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Publish</Label>
          <Select value={publishFilter} onValueChange={setPublishFilter}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => setSortBy(sortBy === "newest" ? "importance" : "newest")}
        >
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === "newest" ? "Newest" : "Score"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{sales.length} events</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No events found.</p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <div key={sale.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="inline-flex items-center gap-0.5 text-[10px]">
                      {reviewIcon(sale.review_status)} {sale.review_status}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${publishBadge(sale.publish_status)}`}>
                      {sale.publish_status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {sale.sale_tier} · score {sale.importance_score}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{sale.sale_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sale.platform} · {sale.start_date} ~ {sale.end_date}
                  </p>
                </div>
              </div>

              <div className="flex gap-1.5 pt-1 flex-wrap">
                {sale.publish_status !== "published" && (
                  <Button
                    size="sm"
                    className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate(sale.id, { review_status: "approved", publish_status: "published" })}
                  >
                    <Eye className="w-3 h-3" /> Publish
                  </Button>
                )}
                {sale.publish_status === "published" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs h-7"
                    onClick={() => handleStatusUpdate(sale.id, { publish_status: "hidden" })}
                  >
                    <EyeOff className="w-3 h-3" /> Hide
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => openEdit(sale)}>
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(sale.id)}
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSale} onOpenChange={(o) => !o && setEditingSale(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-sm">Title</Label>
              <Input value={editForm.sale_name} onChange={(e) => setEditForm((f) => ({ ...f, sale_name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Platform</Label>
              <Select value={editForm.platform} onValueChange={(v) => setEditForm((f) => ({ ...f, platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm">Start</Label>
                <Input type="date" value={editForm.start_date} onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">End</Label>
                <Input type="date" value={editForm.end_date} onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <Button className="w-full" onClick={handleEditSubmit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
