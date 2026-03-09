import { useAdminSales } from "@/hooks/useSales";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { Link } from "react-router-dom";
import { CheckCircle, Eye, EyeOff, Clock, XCircle, MessageSquare, FileText } from "lucide-react";

export default function AdminOverview() {
  const { data: allSales = [] } = useAdminSales();
  const { data: communityPosts = [] } = useCommunityPosts();

  const total = allSales.length;
  const communityTotal = communityPosts.length;

  const pending = allSales.filter((s) => s.review_status === "pending").length;
  const approved = allSales.filter((s) => s.review_status === "approved" && s.publish_status !== "published" && s.publish_status !== "hidden").length;
  const published = allSales.filter((s) => s.publish_status === "published").length;
  const hidden = allSales.filter((s) => s.publish_status === "hidden").length;
  const rejected = allSales.filter((s) => s.review_status === "rejected").length;

  const communityPending = communityPosts.filter((p) => p.review_status === "pending").length;
  const communityPublished = communityPosts.filter((p) => p.review_status === "published").length;
  const communityApproved = communityPosts.filter((p) => p.review_status === "approved").length;
  const communityHidden = communityPosts.filter((p) => p.review_status === "hidden").length;

  const salesCards = [
    { label: "검토 대기", value: pending, total, icon: Clock, color: "text-yellow-600", to: "/admin/review" },
    { label: "승인됨(초안)", value: approved, total, icon: CheckCircle, color: "text-green-600", to: "/admin/review" },
    { label: "게시됨", value: published, total, icon: Eye, color: "text-primary", to: "/admin/events" },
    { label: "숨김", value: hidden, total, icon: EyeOff, color: "text-muted-foreground", to: "/admin/hidden" },
    { label: "반려됨", value: rejected, total, icon: XCircle, color: "text-destructive", to: "/admin/rejected" },
  ];

  const communityCards = [
    { label: "검토 대기", value: communityPending, total: communityTotal, icon: Clock, color: "text-yellow-600", to: "/admin/community" },
    { label: "게시됨", value: communityPublished, total: communityTotal, icon: Eye, color: "text-primary", to: "/admin/community" },
    { label: "승인됨", value: communityApproved, total: communityTotal, icon: CheckCircle, color: "text-green-600", to: "/admin/community" },
    { label: "숨김", value: communityHidden, total: communityTotal, icon: EyeOff, color: "text-muted-foreground", to: "/admin/community" },
  ];

  return (
    <div className="space-y-6">
      {/* Sales */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> 세일 이벤트
          <span className="text-xs font-normal">({total}건)</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {salesCards.map(({ label, value, total: t, icon: Icon, color, to }) => (
            <Link key={label} to={to}
              className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <Icon className={`w-8 h-8 ${color}`} />
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-card-foreground">{value}</p>
                  <span className="text-sm text-muted-foreground font-medium">/ {t}</span>
                </div>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Community */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4" /> 커뮤니티
          <span className="text-xs font-normal">({communityTotal}건)</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {communityCards.map(({ label, value, total: t, icon: Icon, color, to }) => (
            <Link key={`community-${label}`} to={to}
              className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <Icon className={`w-7 h-7 ${color}`} />
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-card-foreground">{value}</p>
                  <span className="text-sm text-muted-foreground font-medium">/ {t}</span>
                </div>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
