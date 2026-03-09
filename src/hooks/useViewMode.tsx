import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ViewMode = "auto" | "desktop" | "mobile";

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: "auto",
  setViewMode: () => {},
});

const DESKTOP_WIDTH = 1280;

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("auto");

  // Dynamically update the viewport meta tag so the browser
  // actually lays out at desktop width on small screens.
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;

    if (viewMode === "desktop") {
      meta.setAttribute("content", `width=${DESKTOP_WIDTH}, initial-scale=0.25, user-scalable=yes`);
    } else {
      meta.setAttribute("content", "width=device-width, initial-scale=1.0");
    }

    return () => {
      // Reset on unmount
      meta.setAttribute("content", "width=device-width, initial-scale=1.0");
    };
  }, [viewMode]);

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
