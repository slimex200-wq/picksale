import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface Submission {
  id: string;
  platform: string | null;
  sale_name: string;
  link: string;
  start_date: string | null;
  end_date: string | null;
  category: string | null;
  description: string | null;
  submitter_email: string | null;
  status: string;
  created_at: string;
}

export default function AdminSubmissions() {
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["sale_submissions", "pending"],
    queryFn: async (): Promise<Submission[]> => {
      const { data, error } = await supabase
        .from("sale_submissions")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleApprove = async (sub: Submission) => {
    try {
      const { error: insertError } = await supabase.from("sales").insert({
        platform: sub.platform || "커뮤니티 핫딜",
        sale_name: sub.sale_name,
        start_date: sub.start_date || new Date().toISOString().split("T")[0],
        end_date: sub.end_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        category: sub.category ? sub.category.split(",").map((c) => c.trim()) : [],
        link: sub.link,
        description: sub.description || "",
        review_status: "approved",
        publish_status: "published",
      });
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("sale_submissions")
        .update({ status: "approved" })
        .eq("id", sub.id);
      if (updateError) throw updateError;

      toast.success("제보가 승인되어 게시되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["sale_submissions"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    } catch (err: any) {
      toast.error(err.message || "승인에 실패했습니다.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sale_submissions")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      toast.success("반려되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["sale_submissions"] });
    } catch (err: any) {
      toast.error(err.message || "반려에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{submissions.length}개 대기 중</p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-12">불러오는 중...</p>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">대기 중인 제보가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-card border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-card-foreground">{sub.sale_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.platform || "미지정"} · {new Date(sub.created_at).toLocaleDateString("ko-KR")}
                  </p>
                  {sub.start_date && sub.end_date && (
                    <p className="text-xs text-muted-foreground">{sub.start_date} ~ {sub.end_date}</p>
                  )}
                </div>
                {sub.link && (
                  <a href={sub.link} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>
              {sub.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{sub.description}</p>
              )}
              {sub.submitter_email && (
                <p className="text-[10px] text-muted-foreground">제보자: {sub.submitter_email}</p>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="default" className="gap-1 text-xs h-7" onClick={() => handleApprove(sub)}>
                  <CheckCircle className="w-3 h-3" /> 승인 → 게시
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleReject(sub.id)}>
                  <XCircle className="w-3 h-3" /> 반려
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
