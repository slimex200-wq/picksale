import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
        </nav>

        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground text-sm">© 2026 PickSale</p>
          <p>
            PickSale은 온라인 쇼핑몰의 세일 및 이벤트 정보를 모아 제공하는 큐레이션 서비스입니다.
          </p>
          <p>
            각 상품 정보, 가격, 세일 내용 및 이벤트 정보는 해당 쇼핑 플랫폼에서 제공하는 내용이며 변경될 수 있습니다.
          </p>
          <p>
            PickSale은 상품을 직접 판매하지 않으며 외부 쇼핑몰에서 이루어지는 거래에 대해 책임을 지지 않습니다.
          </p>
          <p>
            문의:{" "}
            <a href="mailto:slimex200@gmail.com" className="underline hover:text-foreground transition-colors">
              slimex200@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
