import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PLATFORM_OPTIONS, useUserPreferences } from "@/hooks/useUserPreferences";
import PlatformLogo from "@/components/PlatformLogo";
import { Check, Star } from "lucide-react";
import type { Platform } from "@/data/salesUtils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FavoritePlatformsModal({ open, onOpenChange }: Props) {
  const { favoritePlatforms, savePlatforms, isSaving } = useUserPreferences();
  const [selected, setSelected] = useState<Platform[]>([]);

  useEffect(() => {
    if (open) setSelected([...favoritePlatforms]);
  }, [open, favoritePlatforms]);

  const toggle = (platform: Platform) => {
    setSelected((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleSave = async () => {
    try {
      await savePlatforms(selected);
      toast.success("관심 플랫폼이 저장되었습니다");
      onOpenChange(false);
    } catch {
      toast.error("저장에 실패했습니다");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            관심 플랫폼 설정
          </DialogTitle>
          <DialogDescription>
            관심 있는 플랫폼을 선택하면 홈에서 해당 세일만 먼저 볼 수 있어요.
            아무것도 선택하지 않으면 전체 세일을 표시합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 py-2">
          {PLATFORM_OPTIONS.map(({ key, label }) => {
            const isSelected = selected.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-border/80 hover:bg-accent/50"
                }`}
              >
                <div className="w-8 h-8 rounded-[22%] border border-black/5 overflow-hidden shrink-0 flex items-center justify-center bg-background">
                  <PlatformLogo platform={key} className="w-6 h-6 object-contain" />
                </div>
                <span className={`text-sm font-semibold flex-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {label}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setSelected([])}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            전체 초기화
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
