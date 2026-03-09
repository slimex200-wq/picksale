import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import ViewModeToggle from "@/components/ViewModeToggle";

export default function LandingPage() {
  const { user, loading } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      const [sales, posts] = await Promise.all([
        supabase.from("sales").select("id", { count: "exact", head: true }).eq("publish_status", "published"),
        supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("review_status", "published"),
      ]);
      return { sales: sales.count ?? 0, posts: posts.count ?? 0 };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-white/20">
      {/* View mode toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ViewModeToggle />
      </div>
      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-white/[0.015] blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg space-y-16">
        {/* Brand mark */}
        <div className="space-y-8">
          <h1 className="text-white text-[clamp(2.5rem,8vw,4.5rem)] font-black tracking-[-0.03em] leading-none">
            PickSale
          </h1>
          <p className="text-[#a1a1aa] text-base sm:text-lg font-medium tracking-tight">
            한국 쇼핑 세일 전체 레이더
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-[#09090b] text-sm font-bold hover:bg-white/90 transition-colors"
          >
            로그인하고 참여하기
          </Link>
          <Link
            to="/home"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5 hover:text-white transition-all"
          >
            둘러보기
            <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Live stats */}
        {stats && (stats.sales > 0 || stats.posts > 0) && (
          <p className="text-[#52525b] text-xs tracking-wide">
            현재 감지된 세일 이벤트{" "}
            {stats.sales > 0 && (
              <span className="text-[#a1a1aa]">{stats.sales}건</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}