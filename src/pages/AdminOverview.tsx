import { useAdminSales } from "@/hooks/useSales";
import { Link } from "react-router-dom";
import { Inbox, List, CheckCircle, Eye, EyeOff, Clock } from "lucide-react";

export default function AdminOverview() {
  const { data: allSales = [] } = useAdminSales();

  const pending = allSales.filter((s) => s.review_status === "pending").length;
  const approved = allSales.filter((s) => s.review_status === "approved").length;
  const published = allSales.filter((s) => s.publish_status === "published").length;
  const hidden = allSales.filter((s) => s.publish_status === "hidden").length;

  const cards = [
    { label: "Pending Review", value: pending, icon: Clock, color: "text-yellow-600", to: "/admin/review" },
    { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-600", to: "/admin/events" },
    { label: "Published", value: published, icon: Eye, color: "text-primary", to: "/admin/events" },
    { label: "Hidden", value: hidden, icon: EyeOff, color: "text-muted-foreground", to: "/admin/events" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ label, value, icon: Icon, color, to }) => (
        <Link
          key={label}
          to={to}
          className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <Icon className={`w-8 h-8 ${color}`} />
          <div>
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
