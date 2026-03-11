import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface DocumentPageLayoutProps {
  children: React.ReactNode;
}

export default function DocumentPageLayout({ children }: DocumentPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal top bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center px-4 py-3">
          <Link
            to="/home"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            PickSale
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        {children}
      </main>

      {/* Inline minimal footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-2xl mx-auto px-4 text-center text-xs text-muted-foreground space-y-1">
          <nav className="flex items-center justify-center gap-1.5">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </nav>
          <p>© 2026 PickSale</p>
        </div>
      </footer>
    </div>
  );
}
