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

const DESKTOP_MIN_WIDTH = 1280;

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("auto");

  // Apply CSS zoom to fit desktop layout on small screens
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    const apply = () => {
      if (viewMode === "desktop" && window.innerWidth < DESKTOP_MIN_WIDTH) {
        const zoom = window.innerWidth / DESKTOP_MIN_WIDTH;
        root.style.zoom = String(zoom);
        root.style.minWidth = `${DESKTOP_MIN_WIDTH}px`;
        root.style.overflowX = "hidden";
      } else {
        root.style.zoom = "";
        root.style.minWidth = "";
        root.style.overflowX = "";
      }
    };

    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      root.style.zoom = "";
      root.style.minWidth = "";
      root.style.overflowX = "";
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
