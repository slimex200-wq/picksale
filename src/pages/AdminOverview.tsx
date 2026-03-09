import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { CheckCircle, Eye, EyeOff, Clock, XCircle, MessageSquare } from "lucide-react";
import { countByPrimaryState } from "@/data/adminStateModel";
import SourceDistribution from "@/components/admin/SourceDistribution";

export default function AdminOverview() {
  const [activeSource, setActiveSource] = useState("");

  const { data } = useQuery({
    queryKey: ["admin_overview_counts"],
    queryFn: async () => {
      const [salesRes, communityRes] = await Promise.all([
        supabase.from("sales").select("review_status, publish_status, source_type, end_date"),
        supabase.from("community_posts").select("review_status", { count: "exact" }),
      ]);
      const sales = salesRes.data ?? [];
      const community = communityRes.data ?? [];
      const states = countByPrimaryState(sales);
      const communityPending = community.filter((p: any) => p.review_status === "pending").length;
      return { states, sales, total: sales.length, communityPending, communityTotal: community.length };
    },
    refetchInterval: 30000,
  });

  if (!data) return null;
  const { states, sales, total, communityPending, communityTotal } = data;

  const stateCards = [
    { label: "검토 대기", value: states.review_pending, icon: Clock, color: "text-yellow-600", to: "/admin/review" },
    { label: "승인(초안)", value: states.approved_draft, icon: CheckCircle, color: "text-green-600", to: "/admin/drafts" },
    { label: "게시됨", value: states.published, icon: Eye, color: "text-primary", to: "/admin/events" },
    { label: "숨김", value: states.hidden, icon: EyeOff, color: "text-muted-foreground", to: "/admin/hidden" },
    { label: "반려", value: states.rejected, icon: XCircle, color: "text-destructive", to: "/admin/rejected" },
    { label: "커뮤니티", value: communityPending, icon: MessageSquare, color: "text-blue-600", to: "/admin/community", denominator: communityTotal },
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

      <div className="mt-6">
        <SourceDistribution
          sales={sales}
          activeSource={activeSource}
          onSourceChange={setActiveSource}
          contextLabel="전체 세일"
        />
      </div>
    </div>
  );
}
