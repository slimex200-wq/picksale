import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CheckCircle, Eye, EyeOff, Clock, XCircle, MessageSquare, Globe, Newspaper } from "lucide-react";
import { countByPrimaryState, countBySourceClass } from "@/data/adminStateModel";

export default function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin_overview_counts"],
    queryFn: async () => {
      const [salesRes, communityRes] = await Promise.all([
        supabase.from("sales").select("review_status, publish_status, source_type"),
        supabase.from("community_posts").select("review_status", { count: "exact" }),
      ]);
      const sales = salesRes.data ?? [];
      const community = communityRes.data ?? [];
      const states = countByPrimaryState(sales);
      const sources = countBySourceClass(sales);
      const communityPending = community.filter((p: any) => p.review_status === "pending").length;
      return { states, sources, total: sales.length, communityPending, communityTotal: community.length };
    },
    refetchInterval: 30000,
  });

  if (!data) return null;
  const { states, sources, total, communityPending, communityTotal } = data;

  const stateCards = [
    { label: "검토 대기", value: states.review_pending, icon: Clock, color: "text-yellow-600", to: "/admin/review" },
    { label: "승인(초안)", value: states.approved_draft, icon: CheckCircle, color: "text-green-600", to: "/admin/review" },
    { label: "게시됨", value: states.published, icon: Eye, color: "text-primary", to: "/admin/events" },
    { label: "숨김", value: states.hidden, icon: EyeOff, color: "text-muted-foreground", to: "/admin/hidden" },
    { label: "반려", value: states.rejected, icon: XCircle, color: "text-destructive", to: "/admin/rejected" },
    { label: "커뮤니티", value: communityPending, icon: MessageSquare, color: "text-blue-600", to: "/admin/community", denominator: communityTotal },
  ];

  const sourceCards = [
    { label: "공식", value: sources.official, icon: Globe, color: "text-blue-600" },
    { label: "뉴스", value: sources.news, icon: Newspaper, color: "text-amber-600" },
    { label: "커뮤니티", value: sources.community, icon: MessageSquare, color: "text-purple-600" },
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

      <h3 className="text-sm font-semibold text-muted-foreground mt-6">소스별 분포</h3>
      <div className="grid grid-cols-3 gap-3">
        {sourceCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3 flex items-center gap-2">
            <Icon className={`w-6 h-6 ${color}`} />
            <div>
              <p className="text-lg font-bold text-card-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
