import { Monitor, Smartphone } from "lucide-react";
import { useViewMode } from "@/hooks/useViewMode";

export default function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();

  const cycle = () => {
    if (viewMode === "auto") setViewMode("desktop");
    else if (viewMode === "desktop") setViewMode("mobile");
    else setViewMode("auto");
  };

  const icon = viewMode === "desktop" ? (
    <Monitor className="w-4 h-4" />
  ) : viewMode === "mobile" ? (
    <Smartphone className="w-4 h-4" />
  ) : (
    <Monitor className="w-4 h-4 opacity-50" />
  );

  const label = viewMode === "desktop" ? "데스크탑 뷰" : viewMode === "mobile" ? "모바일 뷰" : "자동";

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
