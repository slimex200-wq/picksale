import { Link, useLocation } from "react-router-dom";
import { Radar, CalendarDays, Send, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "홈", icon: Radar },
  { to: "/calendar", label: "캘린더", icon: CalendarDays },
  { to: "/submit", label: "제보", icon: Send },
  { to: "/admin", label: "관리", icon: Settings },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Radar className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-extrabold text-foreground tracking-tight">
            세일레이더
          </h1>
          <span className="text-[10px] text-muted-foreground font-medium bg-secondary px-1.5 py-0.5 rounded-sm ml-1">
            BETA
          </span>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
