// @ts-nocheck
import { useState, memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink, Pencil, Eye, EyeOff, Trash2, CheckCircle, XCircle,
  RotateCcw, Copy, ChevronDown, ChevronUp, AlertTriangle, Image as ImageIcon,
  Key, Newspaper, Globe, MessageSquare,
} from "lucide-react";
import type { Sale, Platform } from "@/data/salesUtils";
import {
  getSalePrimaryState, primaryStateConfig,
  getSourceClass, sourceClassConfig,
  getUpsertState, upsertStateConfig,
  isRecentlyUpdated,
} from "@/data/adminStateModel";
import PlatformLogo from "@/components/PlatformLogo";
import { toast } from "sonner";

interface AdminSaleCardProps {
  sale: Sale;
  /** Pre-computed duplicate maps for O(1) lookup instead of O(n) filter per card */
  duplicatePublished?: Map<string, number>;
  duplicateDrafts?: Map<string, number>;
  /** @deprecated Use duplicatePublished/duplicateDrafts instead */
  allSales?: Sale[];
  actions?: ("approve" | "publish" | "reject" | "hide" | "restore" | "restore_review" | "edit" | "delete")[];
  onAction: (id: string, action: string) => void;
  onEdit?: (sale: Sale) => void;
}

export default memo(function AdminSaleCard({ sale, duplicatePublished, duplicateDrafts, allSales = [], actions = [], onAction, onEdit }: AdminSaleCardProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  const primaryState = getSalePrimaryState(sale);
  const stateConf = primaryStateConfig[primaryState];
  const sourceClass = getSourceClass(sale);
  const srcConf = sourceClassConfig[sourceClass];
  const upsertState = getUpsertState(sale);
  const upsertConf = upsertStateConfig[upsertState];
  const recentlyUpdated = isRecentlyUpdated(sale);

  // Use pre-computed maps if available, otherwise fall back to legacy allSales filter
  const sameEventKeyPublishedCount = useMemo(() => {
    if (!sale.event_key) return 0;
    if (duplicatePublished) {
      const total = duplicatePublished.get(sale.event_key) ?? 0;
      // Subtract self if this sale is published
      return sale.publish_status === "published" ? Math.max(0, total - 1) : total;
    }
    return allSales.filter(s => s.id !== sale.id && s.event_key === sale.event_key && s.publish_status === "published").length;
  }, [sale.event_key, sale.id, sale.publish_status, duplicatePublished, allSales]);

  const sameEventKeyDraftsCount = useMemo(() => {
    if (!sale.event_key) return 0;
    if (duplicateDrafts) {
      const total = duplicateDrafts.get(sale.event_key) ?? 0;
      return sale.publish_status === "draft" ? Math.max(0, total - 1) : total;
    }
    return allSales.filter(s => s.id !== sale.id && s.event_key === sale.event_key && s.publish_status === "draft").length;
  }, [sale.event_key, sale.id, sale.publish_status, duplicateDrafts, allSales]);

  const hasValidImage = sale.image_url && sale.image_url.trim() !== "" && !imgBroken
    && !/\.(mp4|webm|mov|avi)(\?|$)/i.test(sale.image_url);
  const logoSrc = true; // fallback handled by PlatformLogo

  const copyEventKey = () => {
    if (sale.event_key) {
      navigator.clipboard.writeText(sale.event_key);
      toast.success("event_key 복사됨");
    }
  };

  const tierLabel = sale.sale_tier === "major" ? "주요" : sale.sale_tier === "minor" ? "일반" : "제외";
  const tierClass = sale.sale_tier === "major"
    ? "bg-primary/15 text-primary border-primary/30"
    : sale.sale_tier === "minor"
    ? "bg-secondary text-secondary-foreground"
    : "bg-muted text-muted-foreground";

  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-2">
      {/* Warnings */}
      {sameEventKeyPublishedCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>⚠️ 동일 행사 게시됨 {sameEventKeyPublishedCount}건 존재 — 중복 승인 주의</span>
        </div>
      )}
      {sameEventKeyDraftsCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>동일 event_key 초안 {sameEventKeyDraftsCount}건 — 병합 권장</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Badge row */}
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant="outline" className={`text-[10px] h-5 ${stateConf.className}`}>
              {stateConf.emoji} {stateConf.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] h-5 ${srcConf.className}`}>
              {sourceClass === "official" ? <Globe className="w-2.5 h-2.5 mr-0.5" /> :
               sourceClass === "news" ? <Newspaper className="w-2.5 h-2.5 mr-0.5" /> :
               sourceClass === "community" ? <MessageSquare className="w-2.5 h-2.5 mr-0.5" /> : null}
              {srcConf.label}
            </Badge>
            <Badge variant="outline" className={`text-[10px] h-5 ${tierClass}`}>
              {tierLabel}
            </Badge>
            {upsertState !== "new" && (
              <Badge variant="outline" className={`text-[10px] h-5 ${upsertConf.className}`}>
                {upsertConf.label}
              </Badge>
            )}
            {recentlyUpdated && (
              <Badge variant="outline" className="text-[10px] h-5 bg-cyan-100 text-cyan-700 border-cyan-300 animate-pulse">
                🔄 최근 갱신
              </Badge>
            )}
            {!hasValidImage && (
              <Badge variant="outline" className="text-[10px] h-5 bg-orange-50 text-orange-600 border-orange-200">
                <ImageIcon className="w-2.5 h-2.5 mr-0.5" />이미지 없음
              </Badge>
            )}
            {!sale.event_key && (
              <Badge variant="outline" className="text-[10px] h-5 bg-red-50 text-red-600 border-red-200">
                <Key className="w-2.5 h-2.5 mr-0.5" />event_key 없음
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground font-mono">
              중요도 {sale.importance_score}
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-card-foreground leading-snug">{sale.sale_name}</p>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="font-medium">{sale.platform}</span>
            <span className="font-mono">{sale.start_date} ~ {sale.end_date}</span>
            {sale.start_date === sale.end_date && (
              <span className="text-orange-600 text-[10px]">⚠️ 단일일</span>
            )}
          </div>

          {/* Event key */}
          {sale.event_key && (
            <button onClick={copyEventKey}
              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-mono bg-blue-50 px-1.5 py-0.5 rounded">
              <Key className="w-2.5 h-2.5" />
              {sale.event_key}
              <Copy className="w-2.5 h-2.5" />
            </button>
          )}

          {/* Matched by / filter reason */}
          <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground">
            {sale.matched_by && sale.matched_by !== "" && sale.matched_by !== "none" && (
              <span className="bg-muted px-1.5 py-0.5 rounded">매칭: {sale.matched_by}</span>
            )}
            {sale.latest_pub_date && (
              <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                최신기사 {new Date(sale.latest_pub_date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              </span>
            )}
            {sale.source_urls.length > 1 && (
              <span className="bg-muted px-1.5 py-0.5 rounded">출처 {sale.source_urls.length}건</span>
            )}
            {sale.filter_reason && (
              <span className="bg-muted px-1.5 py-0.5 rounded">사유: {sale.filter_reason}</span>
            )}
          </div>
        </div>

        {/* Thumbnail + external link */}
        <div className="flex items-start gap-1 shrink-0">
          {hasValidImage ? (
            <img
              src={sale.image_url}
              alt=""
              className="w-16 h-16 rounded-md object-cover"
              loading="lazy"
              onError={() => setImgBroken(true)}
            />
          ) : (
            <div className="w-16 h-16 rounded-md bg-accent/40 flex items-center justify-center">
              <PlatformLogo platform={sale.platform as Platform} className="max-w-[40px] max-h-[28px] object-contain" />
            </div>
          )}
          {sale.link && (
            <a href={sale.link} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>

      {/* Source URLs expandable */}
      {sale.source_urls.length > 0 && (
        <div>
          <button onClick={() => setSourcesOpen(!sourcesOpen)}
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
            {sourcesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            출처 {sale.source_urls.length}건 {sourcesOpen ? "접기" : "펼치기"}
          </button>
          {sourcesOpen && (
            <div className="mt-1.5 space-y-1 pl-2 border-l-2 border-border">
              {sale.link && (
                <a href={sale.link} target="_blank" rel="noopener noreferrer"
                  className="block text-[10px] text-primary hover:underline truncate">
                  🔗 대표 링크: {sale.link}
                </a>
              )}
              {sale.latest_source_url && sale.latest_source_url !== sale.link && (
                <a href={sale.latest_source_url} target="_blank" rel="noopener noreferrer"
                  className="block text-[10px] text-amber-700 hover:underline truncate">
                  📰 최신 기사: {sale.latest_source_url}
                </a>
              )}
              {sale.source_urls.filter(u => u !== sale.link && u !== sale.latest_source_url).map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="block text-[10px] text-muted-foreground hover:underline truncate">
                  📎 출처 {i + 1}: {url}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="flex gap-3 text-[10px] text-muted-foreground">
        {sale.created_at && <span>등록 {new Date(sale.created_at).toLocaleDateString("ko-KR")}</span>}
        {sale.updated_at && sale.updated_at !== sale.created_at && (
          <span className={recentlyUpdated ? "text-cyan-700 font-semibold" : ""}>
            갱신 {new Date(sale.updated_at).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="flex gap-1.5 pt-1 flex-wrap">
          {actions.includes("approve") && (
            <Button size="sm" className="gap-1 text-xs h-7" onClick={() => onAction(sale.id, "approve")}>
              <CheckCircle className="w-3 h-3" />승인
            </Button>
          )}
          {actions.includes("publish") && (
            <Button size="sm" className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
              onClick={() => onAction(sale.id, "publish")}>
              <Eye className="w-3 h-3" />게시
            </Button>
          )}
          {actions.includes("reject") && (
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onAction(sale.id, "reject")}>
              <XCircle className="w-3 h-3" />반려
            </Button>
          )}
          {actions.includes("hide") && (
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7"
              onClick={() => onAction(sale.id, "hide")}>
              <EyeOff className="w-3 h-3" />숨김
            </Button>
          )}
          {actions.includes("restore") && (
            <Button size="sm" className="gap-1 text-xs h-7 bg-green-600 hover:bg-green-700"
              onClick={() => onAction(sale.id, "restore")}>
              <RotateCcw className="w-3 h-3" />복원 (게시)
            </Button>
          )}
          {actions.includes("restore_review") && (
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7"
              onClick={() => onAction(sale.id, "restore_review")}>
              검토로 복원
            </Button>
          )}
          {actions.includes("edit") && onEdit && (
            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onEdit(sale)}>
              <Pencil className="w-3 h-3" />수정
            </Button>
          )}
          {actions.includes("delete") && (
            <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive hover:text-destructive"
              onClick={() => onAction(sale.id, "delete")}>
              <Trash2 className="w-3 h-3" />삭제
            </Button>
          )}
        </div>
      )}
    </div>
  );
});
