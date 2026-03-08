import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Radar } from "lucide-react";
import logo from "@/assets/logo.png";

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="PickSale" className="w-12 h-12 rounded-2xl object-cover" />
          <span className="text-2xl font-extrabold tracking-tight text-foreground">PickSale</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
            한국 쇼핑 세일
            <br />
            <span className="text-primary">전체 레이더</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
            쿠팡, 무신사, 올리브영 등 주요 쇼핑몰의 세일을
            <br className="hidden sm:block" />
            실시간으로 추적하고, 커뮤니티와 함께 공유하세요.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-md"
          >
            <Radar className="w-4 h-4" />
            로그인하고 참여하기
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold hover:bg-accent transition-colors"
          >
            둘러보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
