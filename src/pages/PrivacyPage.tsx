import PageMeta from "@/components/PageMeta";
import DocumentPageLayout from "@/components/DocumentPageLayout";

export default function PrivacyPage() {
  return (
    <DocumentPageLayout>
      <PageMeta title="개인정보처리방침 — PickSale" description="PickSale 개인정보처리방침" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">개인정보처리방침</h1>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>PickSale은 현재 사용자로부터 별도의 개인정보를 직접 수집하지 않습니다.</p>
          <p>다만 서비스 운영 및 통계 분석을 위해 다음과 같은 기술적 정보가 자동으로 수집될 수 있습니다.</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>방문 기록</li>
            <li>접속 시간</li>
            <li>브라우저 정보</li>
            <li>기기 정보</li>
          </ul>
          <p>수집된 정보는 서비스 개선 및 통계 분석 목적으로만 사용됩니다.</p>
          <p>향후 로그인, 커뮤니티, 알림 등의 기능이 추가될 경우 개인정보 처리방침은 업데이트될 수 있습니다.</p>
          <div className="pt-2">
            <p className="font-medium text-foreground">문의</p>
            <a href="mailto:slimex200@gmail.com" className="underline hover:text-foreground transition-colors">
              slimex200@gmail.com
            </a>
          </div>
        </div>
      </div>
    </DocumentPageLayout>
  );
}
