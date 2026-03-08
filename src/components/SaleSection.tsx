import { ReactNode } from "react";
import { Sale } from "@/data/salesUtils";
import SaleCard from "./SaleCard";

interface Props {
  title: string;
  emoji: string;
  sales: Sale[];
  emptyIcon?: ReactNode;
  emptyText?: string;
}

export default function SaleSection({ title, emoji, sales, emptyIcon, emptyText }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-foreground px-1 flex items-center gap-2">
        <span>{emoji}</span>
        {title}
        <span className="text-xs text-muted-foreground font-medium ml-1">
          {sales.length}
        </span>
      </h2>
      {sales.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-muted-foreground">
          {emptyIcon}
          <p className="text-xs mt-2">{emptyText ?? "세일이 없습니다."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sales.map((sale) => (
            <div key={sale.id}>
              <SaleCard sale={sale} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
