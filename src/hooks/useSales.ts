import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Sale, Platform } from "@/data/salesUtils";

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id,
        platform: row.platform as Platform,
        sale_name: row.sale_name,
        start_date: row.start_date,
        end_date: row.end_date,
        category: row.category ?? [],
        link: row.link ?? "",
        description: row.description ?? "",
      }));
    },
  });
}
