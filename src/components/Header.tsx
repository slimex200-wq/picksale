import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Flame, Settings, Home, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import logo from "@/assets/logo.png";

const baseNavItems = [
  { to: "/home", label: "홈", icon: Home },
  { to: "/community", label: "레이더", icon: Flame },
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
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <img src={logo} alt="PickSale" className="w-8 h-8 rounded-lg object-cover" />
            <h1 className="text-lg font-extrabold text-foreground tracking-tight">
              PickSale
            </h1>
          </Link>

          {/* User area */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
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
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <User className="w-3.5 h-3.5" />
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === "/home" ? pathname === "/home" : pathname.startsWith(to);
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
