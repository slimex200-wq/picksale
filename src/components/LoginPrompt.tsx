import { useNavigate } from "react-router-dom";
import { useLoginGate, promptMessages } from "@/hooks/useLoginGate";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col gap-2 pt-1">
        <Button onClick={handleLogin} className="w-full rounded-xl h-11 gap-2 font-semibold">
          <LogIn className="w-4 h-4" />
          로그인
        </Button>
        <Button
          variant="ghost"
          onClick={closePrompt}
          className="w-full rounded-xl h-10 text-muted-foreground font-medium"
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

  /* Desktop: glassmorphism centered modal */
  if (!isPromptOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Very light dim overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.06)" }}
        onClick={closePrompt}
      />
      {/* Glass card */}
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
