import { useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { LogIn, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  /** The content to lock behind the gate */
  children: ReactNode;
}

export default function PreviewLoginGate({ children }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return <>{children}</>;

  return (
    <div className="relative">
      {/* Gradient fade from visible content into locked area */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, hsl(var(--background)), transparent)",
        }}
      />

      {/* Locked content — blurred, no interaction, clipped height */}
      <div
        className="overflow-hidden pointer-events-none select-none"
        style={{ maxHeight: 480 }}
        aria-hidden="true"
      >
        <div style={{ filter: "blur(6px)", opacity: 0.55 }}>
          {children}
        </div>
      </div>

      {/* Bottom fade so it doesn't end abruptly */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to top, hsl(var(--background)), transparent)",
        }}
      />

      {/* CTA overlay — centered on the locked area */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
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
