import OpenFin from "@openfin/core";
import { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
  tab: { padding: "4px 8px", minHeight: "28px", height: "28px" },
  tabIndicator: { transition: "all 0.08s linear" },
  tabContainer: { minHeight: "32px", height: "32px", padding: 0 },
  layoutContainer: { height: "100%", width: "100%", overflow: "hidden" },
};

/**
 * The state used by the TabsContainer for maintaining active layouts
 * and their names
 */
export type LayoutState = {
  layoutName: string;
  layout: OpenFin.LayoutOptions;
};
