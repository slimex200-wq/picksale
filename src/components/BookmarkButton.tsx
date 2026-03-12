import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useLoginGate } from "@/hooks/useLoginGate";
import { toast } from "sonner";

interface Props {
  saleId: string;
  size?: number;
  className?: string;
}

export default function BookmarkButton({ saleId, size = 18, className = "" }: Props) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { requireLogin } = useLoginGate();
  const saved = isBookmarked(saleId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    requireLogin(() => {
      toggleBookmark.mutate(saleId, {
        onSuccess: (result) => {
          toast.success(result.action === "added" ? "저장되었습니다 🔖" : "저장이 해제되었습니다");
        },
        onError: () => {
          toast.error("오류가 발생했습니다");
        },
      });
    }, "bookmark");
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1.5 rounded-lg transition-colors ${
        saved
          ? "text-primary bg-primary/10 hover:bg-primary/20"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      } ${className}`}
      title={saved ? "저장 해제" : "저장하기"}
    >
      {saved ? (
        <BookmarkCheck className="shrink-0" style={{ width: size, height: size }} />
      ) : (
        <Bookmark className="shrink-0" style={{ width: size, height: size }} />
      )}
    </button>
  );
}
