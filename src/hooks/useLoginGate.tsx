import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export type LoginPromptContext = "bookmark" | "alert" | "generic";

const promptMessages: Record<LoginPromptContext, { title: string; description: string }> = {
  bookmark: {
    title: "찜은 로그인 후 이용 가능해요",
    description: "마음에 드는 세일을 저장하고 나중에 다시 확인해보세요.",
  },
  alert: {
    title: "알림은 로그인 후 이용 가능해요",
    description: "원하는 세일을 놓치지 않도록 알림을 받아보세요.",
  },
  generic: {
    title: "로그인하면 더 편하게 쓸 수 있어요",
    description: "찜, 알림, 맞춤 기능은 로그인 후 사용할 수 있어요.",
  },
};

interface LoginGateContextType {
  requireLogin: (onSuccess?: () => void, context?: LoginPromptContext) => boolean;
  isPromptOpen: boolean;
  closePrompt: () => void;
  pendingAction: (() => void) | null;
  promptContext: LoginPromptContext;
}

const LoginGateContext = createContext<LoginGateContextType>({
  requireLogin: () => false,
  isPromptOpen: false,
  closePrompt: () => {},
  pendingAction: null,
  promptContext: "generic",
});

export function LoginGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [promptContext, setPromptContext] = useState<LoginPromptContext>("generic");

  const requireLogin = useCallback(
    (onSuccess?: () => void, context: LoginPromptContext = "generic"): boolean => {
      if (user) {
        onSuccess?.();
        return true;
      }
      setPendingAction(() => onSuccess ?? null);
      setPromptContext(context);
      setIsPromptOpen(true);
      return false;
    },
    [user]
  );

  const closePrompt = useCallback(() => {
    setIsPromptOpen(false);
    setPendingAction(null);
  }, []);

  return (
    <LoginGateContext.Provider value={{ requireLogin, isPromptOpen, closePrompt, pendingAction, promptContext }}>
      {children}
    </LoginGateContext.Provider>
  );
}

export function useLoginGate() {
  return useContext(LoginGateContext);
}

export { promptMessages };
