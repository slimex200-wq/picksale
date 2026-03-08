import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      const [sales, posts] = await Promise.all([
        supabase.from("sales").select("id", { count: "exact", head: true }).eq("publish_status", "published"),
        supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("review_status", "published"),
      ]);
      return {
        sales: sales.count ?? 0,
        posts: posts.count ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-white/20">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(16,85%,58%)] opacity-[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[hsl(16,85%,58%)]/[0.02] to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl space-y-12">
        {/* Brand */}
        <p className="text-[#888] text-xs font-medium tracking-[0.3em] uppercase">
          PickSale
        </p>

        {/* Headline */}
        <div className="space-y-5">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-black text-white tracking-tight leading-[1.1]">
            한국 쇼핑 세일
            <br />
            전체 레이더
          </h1>
          <p className="text-[#777] text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            주요 쇼핑몰의 세일을 실시간으로 추적하고
            <br />
            커뮤니티와 함께 발견하세요.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-[#0a0a0f] text-sm font-bold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            로그인하고 참여하기
          </Link>
          <Link
            to="/home"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/80 text-sm font-semibold hover:bg-white/[0.1] hover:text-white transition-all"
          >
            둘러보기
            <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Stats */}
        {stats && (stats.sales > 0 || stats.posts > 0) && (
          <div className="flex items-center gap-6 text-[#555] text-xs">
            {stats.sales > 0 && (
              <span>
                <span className="text-white/60 font-semibold">{stats.sales}</span> 세일 감지 중
              </span>
            )}
            {stats.posts > 0 && (
              <span>
                <span className="text-white/60 font-semibold">{stats.posts}</span> 커뮤니티 포스트
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom fade line */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
