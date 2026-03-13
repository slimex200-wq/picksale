import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Shirt,
  Sparkles,
  Lamp,
  Armchair,
  Monitor,
  Apple,
  Baby,
  Dumbbell,
  Palette,
  PawPrint,
  type LucideIcon,
} from "lucide-react";
import type { Sale } from "@/data/salesUtils";
import { getSaleStatus } from "@/data/salesUtils";
import { matchesQuickFilter } from "@/data/quickFilterDefs";

interface CategoryDef {
  key: string | null;
  label: string;
  icon: LucideIcon;
}

const CATEGORIES: CategoryDef[] = [
  { key: null, label: "전체", icon: LayoutGrid },
  { key: "fashion", label: "패션", icon: Shirt },
  { key: "beauty", label: "뷰티", icon: Sparkles },
  { key: "home_living", label: "가전·리빙", icon: Lamp },
  { key: "furniture", label: "가구", icon: Armchair },
  { key: "computer_digital", label: "컴퓨터·디지털", icon: Monitor },
  { key: "food", label: "식품", icon: Apple },
  { key: "kids", label: "육아·키즈", icon: Baby },
  { key: "sports_leisure", label: "스포츠·레저", icon: Dumbbell },
  { key: "hobby_stationery", label: "취미·문구", icon: Palette },
  { key: "pets", label: "반려동물", icon: PawPrint },
];

interface Props {
  selected: string[];
  onChange: (selected: string[]) => void;
  sales?: Sale[];
}

export default function RadarCategoryFilter({ selected, onChange, sales = [] }: Props) {
  const isAllActive = selected.length === 0;

  const counts = useMemo(() => {
    const active = sales.filter((s) => getSaleStatus(s) !== "ended");
    const map: Record<string, number> = { all: active.length };
    for (const cat of CATEGORIES) {
      if (cat.key) {
        map[cat.key] = active.filter((s) => matchesQuickFilter(s, cat.key!)).length;
      }
    }
    return map;
  }, [sales]);

  const handleClick = (key: string | null) => {
    if (key === null) {
      onChange([]);
      return;
    }
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em]">
        카테고리
      </span>
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => {
          const isActive = cat.key === null ? isAllActive : selected.includes(cat.key);
          const Icon = cat.icon;
          const count = counts[cat.key ?? "all"] ?? 0;
          return (
            <button
              key={cat.key ?? "all"}
              onClick={() => handleClick(cat.key)}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap flex items-center gap-1 border",
                isActive
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              {count > 0 && (
                <span className={cn(
                  "text-[11px] tabular-nums",
                  isActive ? "text-primary/60" : "text-muted-foreground/50"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
