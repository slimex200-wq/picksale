import PageMeta from "@/components/PageMeta";

export default function TermsPage() {
  return (
    <>
      <PageMeta title="이용약관 — PickSale" description="PickSale 이용약관" />
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">이용약관</h1>
        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">제1조 (서비스 목적)</h2>
            <p>PickSale은 다양한 온라인 쇼핑몰의 세일 및 이벤트 정보를 수집하여 사용자에게 제공하는 정보 큐레이션 서비스입니다.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">제2조 (서비스 내용)</h2>
            <p>PickSale은 외부 쇼핑 플랫폼의 세일, 할인, 이벤트 정보를 모아 사용자에게 제공합니다.</p>
            <p>PickSale은 상품을 직접 판매하거나 중개하지 않습니다.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">제3조 (정보의 정확성)</h2>
            <p>PickSale에 표시되는 세일 정보, 가격, 상품 정보 및 이벤트 내용은 각 쇼핑 플랫폼에서 제공하는 정보를 기반으로 합니다.</p>
            <p>정보의 정확성 및 변경 사항에 대한 책임은 해당 쇼핑 플랫폼에 있으며 PickSale은 정보의 완전성이나 정확성을 보장하지 않습니다.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">제4조 (외부 사이트 링크)</h2>
            <p>PickSale은 외부 쇼핑몰로 연결되는 링크를 포함할 수 있습니다.</p>
            <p>외부 사이트에서 발생하는 거래, 결제, 배송 및 기타 문제에 대해서는 해당 플랫폼 또는 판매자가 책임을 집니다.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-semibold text-foreground">제5조 (서비스 변경)</h2>
            <p>PickSale은 서비스의 일부 또는 전체를 사전 공지 없이 변경하거나 중단할 수 있습니다.</p>
          </section>
        </div>
      </main>
    </>
  );
}
