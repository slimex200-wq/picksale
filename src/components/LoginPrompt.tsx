import { useNavigate } from "react-router-dom";
import { useLoginGate, promptMessages } from "@/hooks/useLoginGate";
import { useIsMobile } from "@/hooks/use-mobile";
import { lovable } from "@/integrations/lovable/index";
import { LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

export default function LoginPrompt() {
  const { isPromptOpen, closePrompt, promptContext } = useLoginGate();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const msg = promptMessages[promptContext];

  const handleLogin = () => {
    closePrompt();
    navigate("/login");
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error("Google 로그인 실패");
    } else {
      closePrompt();
    }
  };

  const body = (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-11 h-11 rounded-full flex items-center justify-center"
        style={{ background: "hsl(var(--primary) / 0.08)" }}>
        <LogIn className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-[15px] font-bold text-foreground">{msg.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {msg.description}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 pt-1">
        <Button onClick={handleLogin} className="w-full rounded-xl h-11 gap-2 font-semibold">
          <LogIn className="w-4 h-4" />
          로그인
        </Button>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 빠르게 로그인
        </button>
        <Button
          variant="ghost"
          onClick={closePrompt}
          className="w-full rounded-xl h-9 text-muted-foreground font-medium text-sm"
        >
          나중에
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isPromptOpen} onOpenChange={(open) => !open && closePrompt()}>
        <DrawerContent
          className="px-6 pb-8 pt-4 border-0"
          style={{
            background: "rgba(255,255,255,0.72)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            backdropFilter: "blur(14px) saturate(140%)",
            borderRadius: "20px 20px 0 0",
            border: "1px solid rgba(255,255,255,0.45)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.06)",
          }}
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>{msg.title}</DrawerTitle>
            <DrawerDescription>{msg.description}</DrawerDescription>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  if (!isPromptOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.06)" }}
        onClick={closePrompt}
      />
      <div
        className="relative z-10 w-full max-w-[340px] mx-4 p-6"
        style={{
          background: "rgba(255,255,255,0.72)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          backdropFilter: "blur(14px) saturate(140%)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          animation: "glassPromptIn 200ms cubic-bezier(0.4,0,0.2,1) forwards",
        }}
      >
        <button
          onClick={closePrompt}
          className="absolute right-3 top-3 rounded-full p-1.5 opacity-40 hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">닫기</span>
        </button>
        {body}
      </div>

      <style>{`
        @keyframes glassPromptIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}