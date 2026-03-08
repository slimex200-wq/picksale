import { useState } from "react";
import { useAdminSales } from "@/hooks/useSales";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sale, platforms, Platform } from "@/data/salesUtils";
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
  CheckCircle,
  XCircle,
  Eye,
  Pencil,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";

export default function AdminReview() {
  const queryClient = useQueryClient();
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "importance">("newest");

  const { data: sales = [], isLoading } = useAdminSales({
    review_status: "pending",
    platform: platformFilter || undefined,
    sale_tier: tierFilter || undefined,
    sort: sortBy,
  });

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState({
    sale_name: "",
    platform: "",
    start_date: "",
    end_date: "",
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["sales"] });
  };

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "publish" | "hide"
  ) => {
    const updates: Record<string, string> = {};
    if (action === "approve") {
      updates.review_status = "approved";
      updates.publish_status = "draft";
    } else if (action === "reject") {
      updates.review_status = "rejected";
    } else if (action === "publish") {
      updates.review_status = "approved";
      updates.publish_status = "published";
    } else if (action === "hide") {
      updates.publish_status = "hidden";
    }

    const { error } = await supabase.from("sales").update(updates).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      action === "approve"
        ? "Approved"
        : action === "reject"
        ? "Rejected"
        : action === "publish"
        ? "Published"
        : "Hidden"
    );
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
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Updated");
    setEditingSale(null);
    invalidate();
  };

  const tierColor = (tier: string) => {
    if (tier === "major") return "bg-primary/15 text-primary border-primary/30";
    if (tier === "minor") return "bg-secondary text-secondary-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Platform</Label>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Tier</Label>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="excluded">Excluded</SelectItem>
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

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Loading…</p>
      ) : sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No pending events.
        </p>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="bg-card border border-border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Badge variant="outline" className={`text-[10px] ${tierColor(sale.sale_tier)}`}>
                      {sale.sale_tier}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      score: {sale.importance_score}
                    </span>
                    {sale.grouped_page_count > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        · {sale.grouped_page_count} pages
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {sale.sale_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.platform} · {sale.start_date} ~ {sale.end_date}
                  </p>
                  {sale.filter_reason && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Reason: {sale.filter_reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Source URLs */}
              {sale.source_urls.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {sale.source_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      Source {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {sale.created_at && (
                <p className="text-[10px] text-muted-foreground">
                  Created: {new Date(sale.created_at).toLocaleString("ko-KR")}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-1.5 pt-1 flex-wrap">
                <Button
                  size="sm"
                  className="gap-1 text-xs h-7"
                  onClick={() => handleAction(sale.id, "approve")}
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction(sale.id, "publish")}
                >
                  <Eye className="w-3 h-3" />
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => handleAction(sale.id, "reject")}
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7"
                  onClick={() => openEdit(sale)}
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingSale} onOpenChange={(o) => !o && setEditingSale(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-sm">Title</Label>
              <Input
                value={editForm.sale_name}
                onChange={(e) => setEditForm((f) => ({ ...f, sale_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Platform</Label>
              <Select
                value={editForm.platform}
                onValueChange={(v) => setEditForm((f) => ({ ...f, platform: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm">Start</Label>
                <Input
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">End</Label>
                <Input
                  type="date"
                  value={editForm.end_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleEditSubmit}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
