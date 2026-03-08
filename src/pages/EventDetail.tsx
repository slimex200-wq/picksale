import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, ArrowLeft, Layers } from "lucide-react";
import { platformLogos } from "@/data/platformLogos";
import type { Platform } from "@/data/salesUtils";
import JsonLd from "@/components/JsonLd";
import CanonicalLink from "@/components/CanonicalLink";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event_detail", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_events")
        .select("*")
        .eq("id", eventId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const { data: linkedSales = [] } = useQuery({
    queryKey: ["event_sales", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("event_id", eventId!)
        .eq("publish_status", "published")
        .order("importance_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!eventId,
  });

  if (eventLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-20 text-center">
        <p className="text-muted-foreground">이벤트를 찾을 수 없습니다.</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">홈으로 →</Link>
      </div>
    );
  }

  const platform = event.platform as Platform;
  const logo = platformLogos[platform];
  const isActive = event.event_status === "active";
  const daysLeft = Math.ceil((new Date(event.end_date).getTime() - Date.now()) / 86400000);

  const eventStatusMap: Record<string, string> = {
    active: "https://schema.org/EventScheduled",
    expired: "https://schema.org/EventCancelled",
    merged: "https://schema.org/EventCancelled",
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.canonical_title,
    startDate: event.start_date,
    endDate: event.end_date,
    eventStatus: eventStatusMap[event.event_status] || "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    url: `${window.location.origin}${location.pathname}`,
    organizer: {
      "@type": "Organization",
      name: event.platform,
    },
    description: `${event.platform} ${event.canonical_title} 세일 이벤트. ${event.start_date} ~ ${event.end_date}`,
    ...(event.canonical_link ? { sameAs: event.canonical_link } : {}),
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
      <JsonLd data={jsonLdData} />
      {/* SEO title */}
      <title>{event.canonical_title} - {event.platform} | PickSale</title>
      <meta name="description" content={`${event.platform} ${event.canonical_title} 세일 이벤트 정보. ${event.start_date} ~ ${event.end_date}`} />

      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />홈
      </Link>

      {/* Event header */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          {logo && (
            <img src={logo} alt={event.platform} className="w-12 h-12 rounded-xl object-cover" />
          )}
          <div className="flex-1">
            <h1 className="text-lg font-bold text-card-foreground">{event.canonical_title}</h1>
            <p className="text-sm text-muted-foreground">{event.platform}</p>
          </div>
          <Badge variant="outline" className={`text-xs ${isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground"}`}>
            {isActive ? "진행중" : event.event_status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {event.start_date} ~ {event.end_date}
          </span>
          {isActive && daysLeft > 0 && (
            <span className="text-primary font-semibold">D-{daysLeft}</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>중요도: <strong className="text-foreground">{event.importance_score}</strong></span>
          <span>시그널: <strong className="text-foreground">{event.signal_count || 0}</strong>개</span>
        </div>

        {event.canonical_link && (
          <a href={event.canonical_link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ExternalLink className="w-4 h-4" />공식 페이지
          </a>
        )}
      </div>

      {/* Linked sales */}
      {linkedSales.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            연결된 세일 ({linkedSales.length})
          </h2>
          <div className="space-y-2">
            {linkedSales.map((sale) => (
              <Link
                key={sale.id}
                to={`/sale/${sale.id}`}
                className="block bg-card border border-border rounded-xl p-3 hover:shadow-sm transition-shadow"
              >
                <p className="text-sm font-semibold text-card-foreground">{sale.sale_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sale.start_date} ~ {sale.end_date}
                </p>
                {sale.link && (
                  <span className="text-xs text-primary flex items-center gap-0.5 mt-1">
                    <ExternalLink className="w-3 h-3" />링크
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
