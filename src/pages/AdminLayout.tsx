import { Outlet, Link, useLocation } from "react-router-dom";
import { Settings, Inbox, List } from "lucide-react";

const tabs = [
  { to: "/admin", label: "개요", icon: Settings, exact: true },
  { to: "/admin/review", label: "검토 대기", icon: Inbox },
  { to: "/admin/events", label: "전체 이벤트", icon: List },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">관리자 패널</h2>
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
