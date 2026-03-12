import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSales } from "@/hooks/useSales";
import SaleCard from "@/components/SaleCard";
import { Bookmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PageMeta from "@/components/PageMeta";
import CanonicalLink from "@/components/CanonicalLink";

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { bookmarkedSaleIds, isLoading: bmLoading } = useBookmarks();
  const { data: allSales = [], isLoading: salesLoading } = useSales();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  const isLoading = bmLoading || salesLoading;
  const bookmarkedSales = allSales.filter((s) => bookmarkedSaleIds.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-8 pb-28 sm:pb-24 space-y-6">
      <PageMeta title="저장한 세일 - PickSale" description="내가 저장한 세일 목록입니다." />
      <CanonicalLink href={window.location.origin + "/bookmarks"} />

      <div className="flex items-center gap-2.5">
        <Bookmark className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-extrabold tracking-tight">저장한 세일</h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-normal">내가 찜한 세일을 모아보세요</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : bookmarkedSales.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Bookmark className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium">저장한 세일이 없습니다</p>
          <p className="text-xs mt-1">마음에 드는 세일의 북마크 아이콘을 눌러 저장해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bookmarkedSales.map((sale) => (
            <SaleCard key={sale.id} sale={sale} />
          ))}
        </div>
      )}
    </div>
  );
}
