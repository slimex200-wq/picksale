import PageMeta from "@/components/PageMeta";
import DocumentPageLayout from "@/components/DocumentPageLayout";

export default function AboutPage() {
  return (
    <DocumentPageLayout>
      <PageMeta title="About — PickSale" description="PickSale은 여러 온라인 쇼핑몰의 세일 및 이벤트 정보를 한 곳에서 확인할 수 있도록 정리해주는 큐레이션 서비스입니다." />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">About PickSale</h1>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            PickSale은 여러 온라인 쇼핑몰의 세일 및 이벤트 정보를
            한 곳에서 확인할 수 있도록 정리해주는 큐레이션 서비스입니다.
          </p>
          <p>
            사용자가 여러 쇼핑몰을 일일이 확인해야 하는 번거로움을 줄이고
            현재 진행 중인 할인 정보와 이벤트를 빠르게 찾을 수 있도록 돕는 것을 목표로 합니다.
          </p>
          <p>
            PickSale은 상품을 직접 판매하지 않으며
            상품 정보 및 구매는 각 쇼핑 플랫폼의 페이지에서 이루어집니다.
          </p>
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
