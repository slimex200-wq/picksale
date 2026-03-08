import { Sale } from "@/data/mockSales";
import SaleCard from "./SaleCard";

interface Props {
  title: string;
  emoji: string;
  sales: Sale[];
}

export default function SaleSection({ title, emoji, sales }: Props) {
  if (sales.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-bold text-foreground px-1 flex items-center gap-2">
        <span>{emoji}</span>
        {title}
        <span className="text-xs text-muted-foreground font-medium ml-1">
          {sales.length}
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sales.map((sale) => (
          <div key={sale.id}>
            <SaleCard sale={sale} />
          </div>
        ))}
      </div>
    </section>
  );
}
