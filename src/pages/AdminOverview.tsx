import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CheckCircle, Eye, EyeOff, Clock, XCircle, MessageSquare, Globe, Newspaper, MessageSquare as MsgSq, RefreshCw } from "lucide-react";
import { countByPrimaryState, getSourceClass, isRecentlyUpdated } from "@/data/adminStateModel";
import { useMemo } from "react";

export default function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin_overview_counts"],
    queryFn: async () => {
      const [salesRes, communityRes] = await Promise.all([
        supabase.from("sales").select("review_status, publish_status, source_type, end_date, updated_at, created_at, matched_by"),
        supabase.from("community_posts").select("review_status", { count: "exact" }),
      ]);
      const sales = salesRes.data ?? [];
      const community = communityRes.data ?? [];
      const states = countByPrimaryState(sales);
      const communityPending = community.filter((p: any) => p.review_status === "pending").length;
      let recentUpdates = 0;
      for (const s of sales) if (isRecentlyUpdated(s)) recentUpdates++;
      return { states, sales, total: sales.length, communityPending, communityTotal: community.length, recentUpdates };
    },
    refetchInterval: 30000,
  });

  const sourceCounts = useMemo(() => {
    if (!data) return { official: 0, news: 0, community: 0, unknown: 0 };
    const c = { official: 0, news: 0, community: 0, unknown: 0 };
    for (const s of data.sales) c[getSourceClass(s)]++;
    return c;
  }, [data]);

  if (!data) return null;
  const { states, total, communityPending, communityTotal, recentUpdates } = data;

  const stateCards = [
    { label: "검토 대기", value: states.review_pending, icon: Clock, color: "text-yellow-600", to: "/admin/review" },
    { label: "승인(초안)", value: states.approved_draft, icon: CheckCircle, color: "text-green-600", to: "/admin/drafts" },
    { label: "게시됨", value: states.published, icon: Eye, color: "text-primary", to: "/admin/events" },
    { label: "숨김", value: states.hidden, icon: EyeOff, color: "text-muted-foreground", to: "/admin/hidden" },
    { label: "반려", value: states.rejected, icon: XCircle, color: "text-destructive", to: "/admin/rejected" },
    { label: "커뮤니티", value: communityPending, icon: MessageSquare, color: "text-blue-600", to: "/admin/community", denominator: communityTotal },
  ];

  const sourceItems = [
    { label: "공식", count: sourceCounts.official, icon: Globe, color: "text-blue-600" },
    { label: "뉴스", count: sourceCounts.news, icon: Newspaper, color: "text-amber-600" },
    { label: "커뮤니티", count: sourceCounts.community, icon: MsgSq, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground">상태별 현황</h3>
      <div className="grid grid-cols-2 gap-3">
        {stateCards.map(({ label, value, icon: Icon, color, to, denominator }) => (
          <Link key={label} to={to}
            className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <Icon className={`w-8 h-8 ${color}`} />
            <div>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-card-foreground">{value}</p>
                <span className="text-sm text-muted-foreground font-medium">/ {denominator ?? total}</span>
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Source summary — read-only on overview */}
      <div className="space-y-1.5 mt-6">
        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">소스별 분포 · 전체 세일</h4>
        <div className="grid grid-cols-3 gap-2">
          {sourceItems.map(({ label, count, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-lg p-2.5 flex items-center gap-2"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <div className="text-left">
                <p className="text-base font-bold text-card-foreground">{count}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
