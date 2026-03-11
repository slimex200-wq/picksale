import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-6 pb-24 md:pb-6" style={{ paddingBottom: 'max(6rem, calc(4rem + env(safe-area-inset-bottom)))' }}>
      <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
        <nav className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </nav>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p className="font-medium text-foreground/80">© 2026 PickSale</p>
          <p>Sale &amp; event curation service</p>
          <p>
            Contact:{" "}
            <a href="mailto:slimex200@gmail.com" className="underline hover:text-foreground transition-colors">
              slimex200@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
