import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface LoginGateContextType {
  /** Returns true if user is logged in (action can proceed). Shows prompt if not. */
  requireLogin: (onSuccess?: () => void) => boolean;
  isPromptOpen: boolean;
  closePrompt: () => void;
  pendingAction: (() => void) | null;
}

const LoginGateContext = createContext<LoginGateContextType>({
  requireLogin: () => false,
  isPromptOpen: false,
  closePrompt: () => {},
  pendingAction: null,
});

export function LoginGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireLogin = useCallback(
    (onSuccess?: () => void): boolean => {
      if (user) {
        onSuccess?.();
        return true;
      }
      setPendingAction(() => onSuccess ?? null);
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
    <LoginGateContext.Provider value={{ requireLogin, isPromptOpen, closePrompt, pendingAction }}>
      {children}
    </LoginGateContext.Provider>
  );
}

export function useLoginGate() {
  return useContext(LoginGateContext);
}
