import OpenFin from "@openfin/core";
import { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
  smallIcon: { fontSize: 20 },
  iconButton: { padding: "4px" },
  tab: { padding: "4px 8px", minHeight: "28px", height: "28px" },
  tabIndicator: { transition: "all 0.08s linear" },
  tabContainer: { minHeight: "32px", height: "32px", padding: 0 },
  tabControlsContainer: { borderBottom: 1, borderColor: "divider" },
  layoutContainer: { height: "100%", width: "100%", overflow: "hidden" },
};


// Our default Layout for when the add Layout button is clicked.
export const DEFAULT_LAYOUT = {
  content: [
    {
      type: 'stack',
      content: [
        {
          type: 'component',
          componentName: 'view',
          componentState: {
            url: 'https://finance.google.com'
          }
        }
      ]
    }
  ]
}

/**
 * The state used by the TabsContainer for maintaining active layouts
 * and their names
 */
export type LayoutState = {
  layoutName: string;
  layout: OpenFin.LayoutOptions;
};
