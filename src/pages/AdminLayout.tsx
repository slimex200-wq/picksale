import { useEffect, useRef } from "react";
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
  { to: "/admin/all", label: "전체", icon: List, countKey: "all" },
  { to: "/admin/review", label: "검토", icon: Inbox, countKey: "review" },
  { to: "/admin/drafts", label: "승인(초안)", icon: List, countKey: "drafts" },
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
  const navRef = useRef<HTMLElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  // Scroll active tab into view on route change
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [pathname]);

  // Enable horizontal wheel scrolling on desktop
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        nav.scrollLeft += e.deltaY;
      }
    };
    nav.addEventListener("wheel", onWheel, { passive: false });
    return () => nav.removeEventListener("wheel", onWheel);
  }, []);

  const { data: counts } = useQuery({
    queryKey: ["admin_tab_counts"],
    queryFn: async () => {
      const [salesRes, signalsRes, communityRes, submissionsRes] = await Promise.all([
        supabase.from("sales").select("review_status, publish_status, end_date", { count: "exact" }),
        supabase.from("sale_signals").select("review_status", { count: "exact" }).eq("review_status", "pending"),
        supabase.from("community_posts").select("review_status", { count: "exact" }),
        supabase.from("sale_submissions").select("status", { count: "exact" }),
      ]);

      // Separate query for total signals count
      const signalsTotalRes = await supabase.from("sale_signals").select("id", { count: "exact", head: true });

      const sales = salesRes.data ?? [];
      const signalsPending = signalsRes.data?.length ?? 0;
      const signalsTotal = signalsTotalRes.count ?? 0;
      const community = communityRes.data ?? [];
      const submissions = submissionsRes.data ?? [];

      const states = countByPrimaryState(sales);
      const salesTotal = sales.length;
      const communityPublished = community.filter((p: any) => p.review_status === "published").length;
      const communityTotal = community.length;
      const subsPending = submissions.filter((s: any) => s.status === "pending").length;
      const subsTotal = submissions.length;

      return {
        all: { highlight: salesTotal, total: salesTotal },
        review: { highlight: states.review_pending, total: salesTotal },
        drafts: { highlight: states.approved_draft, total: salesTotal },
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

      {/* Scrollable tab strip with fade hints */}
      <div className="relative mb-6">
        <nav
          ref={navRef}
          className="flex gap-0.5 border-b border-border overflow-x-auto scrollbar-hide"
        >
          {tabDefs.map(({ to, label, icon: Icon, exact, countKey }) => {
            const active = exact ? pathname === to : pathname.startsWith(to) && pathname !== "/admin";
            const c = countKey && counts ? counts[countKey] : null;
            return (
              <Link
                key={to}
                to={to}
                ref={active ? activeTabRef : undefined}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors shrink-0 ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {c && c.highlight > 0 && (
                  <span className="ml-0.5 text-[10px] font-bold text-primary">
                    {countKey === "signals" ? c.highlight : `${c.highlight}/${c.total}`}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent" />
      </div>

      <Outlet />
    </div>
  );
}
