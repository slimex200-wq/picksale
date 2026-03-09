import { Badge } from "@/components/ui/badge";
import { Newspaper, RefreshCw, Link2 } from "lucide-react";
import type { Sale } from "@/data/salesUtils";

/** Renders contextual badges for event_key, source_type, latest_pub_date */
export function SaleMetaBadges({ sale }: { sale: Sale }) {
  return (
    <>
      {sale.event_key && (
        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200">
          🔑 {sale.event_key}
        </Badge>
      )}
      {sale.source_type === "news" && (
        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-amber-50 text-amber-700 border-amber-200">
          <Newspaper className="w-2.5 h-2.5 mr-0.5" />뉴스
        </Badge>
      )}
      {sale.latest_pub_date && (
        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-green-50 text-green-700 border-green-200">
          <RefreshCw className="w-2.5 h-2.5 mr-0.5" />
          최신 {new Date(sale.latest_pub_date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
        </Badge>
      )}
      {sale.source_urls.length > 1 && (
        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-muted text-muted-foreground">
          <Link2 className="w-2.5 h-2.5 mr-0.5" />소스 {sale.source_urls.length}건
        </Badge>
      )}
    </>
  );
}

/** Renders source URLs list */
export function SaleSourceLinks({ sale }: { sale: Sale }) {
  if (sale.source_urls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {sale.source_urls.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5">
          <Link2 className="w-2.5 h-2.5" />출처 {i + 1}
        </a>
      ))}
    </div>
  );
}
