import { useNavigate } from "react-router-dom";
import { useLoginGate } from "@/hooks/useLoginGate";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

export default function LoginPrompt() {
  const { isPromptOpen, closePrompt } = useLoginGate();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleLogin = () => {
    closePrompt();
    navigate("/login");
  };

  const body = (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <LogIn className="w-5 h-5 text-primary" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-foreground">로그인하고 계속 보기</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          찜, 알림, 세일 바로가기 같은 기능은<br />로그인 후 사용할 수 있어요.
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
        <DrawerContent className="px-6 pb-8 pt-4">
          <DrawerHeader className="sr-only">
            <DrawerTitle>로그인하고 계속 보기</DrawerTitle>
            <DrawerDescription>로그인이 필요한 기능입니다.</DrawerDescription>
          </DrawerHeader>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isPromptOpen} onOpenChange={(open) => !open && closePrompt()}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-6 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>로그인하고 계속 보기</DialogTitle>
          <DialogDescription>로그인이 필요한 기능입니다.</DialogDescription>
        </DialogHeader>
        <button
          onClick={closePrompt}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">닫기</span>
        </button>
        {body}
      </DialogContent>
    </Dialog>
  );
}
