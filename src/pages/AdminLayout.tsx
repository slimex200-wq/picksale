import { Outlet, Link, useLocation } from "react-router-dom";
import { Settings, Inbox, List, LogOut, MessageSquare, Send, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const tabs = [
  { to: "/admin", label: "개요", icon: Settings, exact: true },
  { to: "/admin/review", label: "검토 대기", icon: Inbox },
  { to: "/admin/events", label: "전체 이벤트", icon: List },
  { to: "/admin/community", label: "커뮤니티", icon: MessageSquare },
  { to: "/admin/submissions", label: "제보", icon: Send },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("로그아웃되었습니다.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24">
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

      <nav className="flex gap-1 mb-6 border-b border-border">
        {tabs.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
