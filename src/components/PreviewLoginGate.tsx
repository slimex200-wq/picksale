import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sale } from "@/data/salesUtils";
import SaleCard from "./SaleCard";

interface Props {
  /** Sales to show as blurred preview cards */
  previewSales: Sale[];
}

export default function PreviewLoginGate({ previewSales }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Blurred preview cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 pointer-events-none select-none"
        style={{ filter: "blur(6px)", opacity: 0.6 }}
        aria-hidden="true"
      >
        {previewSales.slice(0, 6).map((sale) => (
          <SaleCard key={sale.id} sale={sale} />
        ))}
      </div>

      {/* CTA overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-6 py-8 sm:px-10 sm:py-10 text-center shadow-lg max-w-sm mx-4 space-y-4">
          <h3 className="text-lg font-bold text-foreground">
            더 많은 세일 보기
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            로그인하면 오늘 발견된 모든 딜을 볼 수 있습니다.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button asChild className="rounded-xl gap-2 h-10 px-6">
              <Link to="/login">
                <LogIn className="w-4 h-4" />
                로그인
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="rounded-xl gap-2 h-10 px-6 text-muted-foreground"
              onClick={() => setDismissed(true)}
            >
              <Eye className="w-4 h-4" />
              그냥 보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
