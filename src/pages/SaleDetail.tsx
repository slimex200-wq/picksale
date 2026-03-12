// @ts-nocheck
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { platformColors, platformEmojis, Platform } from "@/data/salesUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Bell, Calendar } from "lucide-react";
import { toast } from "sonner";
import JsonLd from "@/components/JsonLd";
import CanonicalLink from "@/components/CanonicalLink";
import PageMeta from "@/components/PageMeta";

function formatDate(d: string) {
  const date = new Date(d);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export default function SaleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: sale, isLoading } = useQuery({
    queryKey: ["sale", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        platform: data.platform as Platform,
        category: data.category ?? [],
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-8 text-center">
        <p className="text-muted-foreground">세일을 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
          홈으로
        </Button>
      </div>
    );
  }

  const colorClass = platformColors[sale.platform];

  const now = new Date();
  const endDate = new Date(sale.end_date);
  const isEnded = endDate < now;
  const eventStatus = isEnded
    ? "https://schema.org/EventCancelled"
    : "https://schema.org/EventScheduled";

  const seoTitle = `${sale.platform} ${sale.sale_name} (${sale.start_date}~${sale.end_date}) | PickSale 세일 정보`;
  const seoDesc = `${sale.platform} ${sale.sale_name} 세일이 ${sale.start_date}부터 ${sale.end_date}까지 진행됩니다. PickSale에서 진행중인 모든 세일 정보를 확인하세요.`;

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: sale.sale_name,
    description: sale.description || seoDesc,
    url: `${window.location.origin}${location.pathname}`,
    startDate: sale.start_date,
    endDate: sale.end_date,
    eventStatus,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: sale.link,
    },
    organizer: {
      "@type": "Organization",
      name: sale.platform,
    },
    ...(sale.category.length > 0 ? { keywords: sale.category.join(", ") } : {}),
  };

  return (
    <div className="max-w-lg mx-auto pb-24 px-4 pt-4">
      <PageMeta
        title={seoTitle}
        description={seoDesc}
        ogType="article"
        ogUrl={`${window.location.origin}/sale/${id}`}
        {...(sale.image_url ? { ogImage: sale.image_url } : {})}
      />
      <JsonLd data={jsonLdData} />
      <CanonicalLink href={
        sale.event_id
          ? `${window.location.origin}/event/${sale.event_id}`
          : `${window.location.origin}/sale/${id}`
      } />
      <div className="rounded-2xl overflow-hidden shadow-card border border-border/50 bg-card">
        {/* Platform Header */}
        <div className={`${colorClass} px-4 pt-4 pb-8 relative`}>
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/15 backdrop-blur-sm rounded-xl p-2 text-primary-foreground hover:bg-white/25 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center pt-6">
            <span className="text-4xl">{platformEmojis[sale.platform]}</span>
            <p className="text-primary-foreground/80 text-xs font-bold tracking-wide mt-2 uppercase">
              {sale.platform}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-bold text-card-foreground leading-snug tracking-tight">
            {sale.sale_name}
          </h2>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{formatDate(sale.start_date)} ~ {formatDate(sale.end_date)}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {sale.category.map((cat: string) => (
              <Badge
                key={cat}
                variant="secondary"
                className="text-[11px] font-semibold rounded-full px-3 py-0.5 bg-secondary/80"
              >
                {cat}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {sale.description}
          </p>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              className="w-full rounded-xl gap-2 h-11 font-semibold"
              onClick={() => window.open(sale.link, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              세일 바로가기
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl gap-2 h-11 font-semibold border-border/70"
              onClick={() => toast.success("알림이 설정되었습니다! 🔔")}
            >
              <Bell className="w-4 h-4" />
              알림받기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
