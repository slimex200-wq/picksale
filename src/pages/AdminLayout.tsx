import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Settings, Inbox, List, LogOut, MessageSquare, Send, Radio,
  Bug, Copy, BarChart3, FlaskConical, EyeOff, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { countByPrimaryState } from "@/data/adminStateModel";

const tabDefs = [
  { to: "/admin", label: "개요", icon: Settings, exact: true },
  { to: "/admin/review", label: "검토", icon: Inbox, countKey: "review" },
  { to: "/admin/events", label: "게시됨", icon: List, countKey: "events" },
  { to: "/admin/hidden", label: "숨김", icon: EyeOff, countKey: "hidden" },
  { to: "/admin/rejected", label: "반려", icon: XCircle, countKey: "rejected" },
  { to: "/admin/signals", label: "시그널", icon: Radio, countKey: "signals" },
  { to: "/admin/community", label: "커뮤니티", icon: MessageSquare, countKey: "community" },
  { to: "/admin/submissions", label: "제보", icon: Send, countKey: "submissions" },
  { to: "/admin/signal-debug", label: "디버그", icon: Bug },
  { to: "/admin/duplicates", label: "중복", icon: Copy },
  { to: "/admin/analytics", label: "분석", icon: BarChart3 },
  { to: "/admin/signal-simulator", label: "시뮬레이터", icon: FlaskConical },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  const { data: counts } = useQuery({
    queryKey: ["admin_tab_counts"],
    queryFn: async () => {
      const [salesRes, signalsRes, communityRes, submissionsRes] = await Promise.all([
        supabase.from("sales").select("review_status, publish_status", { count: "exact" }),
        supabase.from("sale_signals").select("review_status", { count: "exact" }),
        supabase.from("community_posts").select("review_status", { count: "exact" }),
        supabase.from("sale_submissions").select("status", { count: "exact" }),
      ]);

      const sales = salesRes.data ?? [];
      const signals = signalsRes.data ?? [];
      const community = communityRes.data ?? [];
      const submissions = submissionsRes.data ?? [];

      const states = countByPrimaryState(sales);
      const salesTotal = sales.length;
      const signalsPending = signals.filter((s: any) => s.review_status === "pending").length;
      const signalsTotal = signals.length;
      const communityPublished = community.filter((p: any) => p.review_status === "published").length;
      const communityTotal = community.length;
      const subsPending = submissions.filter((s: any) => s.status === "pending").length;
      const subsTotal = submissions.length;

      return {
        review: { highlight: states.review_pending, total: salesTotal },
        events: { highlight: states.published, total: salesTotal },
        hidden: { highlight: states.hidden, total: salesTotal },
        rejected: { highlight: states.rejected, total: salesTotal },
        signals: { highlight: signalsPending, total: signalsTotal },
        community: { highlight: communityPublished, total: communityTotal },
        submissions: { highlight: subsPending, total: subsTotal },
      } as Record<string, { highlight: number; total: number }>;
    },
    refetchInterval: 30000,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("로그아웃되었습니다.");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">관리자 패널</h2>
        </div>
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleLogout}>
          <LogOut className="w-3.5 h-3.5" />
          로그아웃
        </Button>
      </div>

      <nav className="flex gap-0.5 mb-6 border-b border-border overflow-x-auto scrollbar-hide">
        {tabDefs.map(({ to, label, icon: Icon, exact, countKey }) => {
          const active = exact ? pathname === to : pathname.startsWith(to) && pathname !== "/admin";
          const c = countKey && counts ? counts[countKey] : null;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {c && (
                <span className={`ml-0.5 text-[10px] font-bold ${c.highlight > 0 ? "text-primary" : "text-muted-foreground"}`}>
                  {c.highlight}/{c.total}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
