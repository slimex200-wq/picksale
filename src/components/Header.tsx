import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Radar, Settings, Home, User, LogOut, Search, Bell, MessageSquare, Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import logo from "@/assets/logo.png";

const baseNavItems = [
  { to: "/home", label: "홈", icon: Home },
  { to: "/radar", label: "레이더", icon: Radar },
  { to: "/community", label: "커뮤니티", icon: MessageSquare },
  { to: "/calendar", label: "캘린더", icon: CalendarDays },
];

const adminNavItem = { to: "/admin", label: "관리", icon: Settings };

export default function Header() {
  const { pathname } = useLocation();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2.5">
          {/* Left: Brand */}
          <Link to="/home" className="flex items-center gap-2.5">
            <img src={logo} alt="PickSale" className="w-9 h-9 rounded-xl object-cover" />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground tracking-tight leading-tight font-display">
                PickSale
              </h1>
              <span className="text-[11px] text-muted-foreground font-medium leading-tight hidden sm:block">
                모든 쇼핑 세일을 한곳에서
              </span>
            </div>
          </Link>

          {/* Center: Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = to === "/home" ? pathname === "/home" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              to="/radar"
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
              title="검색"
            >
              <Search className="w-[18px] h-[18px]" />
            </Link>
            <button
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="알림"
            >
              <Bell className="w-[18px] h-[18px]" />
            </button>

            {user ? (
              <div className="flex items-center gap-1.5 ml-1">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-7 h-7 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="text-xs font-medium text-foreground hidden sm:inline max-w-[80px] truncate">
                  {profile?.username || "사용자"}
                </span>
                <button
                  onClick={signOut}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors ml-1"
              >
                <User className="w-3.5 h-3.5" />
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border md:hidden">
        <div className="max-w-lg mx-auto flex justify-around py-1.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === "/home" ? pathname === "/home" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors min-w-0 ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate max-w-[56px]">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
