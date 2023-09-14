"use client";
import { Box, Tab, Tabs } from "@mui/material";
import OpenFin, { fin } from "@openfin/core";
import React, { CSSProperties, useEffect, useRef } from "react";

const styles: Record<string, CSSProperties> = {
  tab: { padding: "4px 8px", minHeight: "28px", height: "28px" },
  tabIndicator: { transition: "all 0.08s linear" },
  tabContainer: { minHeight: "32px", height: "32px", padding: 0 },
  layoutContainer: { height: "100%", width: "100%", overflow: "hidden" },
};

type LayoutState = {
  layoutName: string;
  layout: OpenFin.LayoutOptions;
};

export default function TabsContainer(): JSX.Element {
  const [layouts, setLayouts] = React.useState<LayoutState[]>([]);
  const [currentActiveTab, setCurrentActiveTab] = React.useState<number>(0);

  const layoutManagerOverride = (
    Base: OpenFin.LayoutManagerConstructor<OpenFin.LayoutSnapshot>
  ) =>
    class POCOverride extends Base {
      // OpenFin internals call this method in layout initialization, here we use it to set our React state
      applyLayoutSnapshot = async ({ layouts }: OpenFin.LayoutSnapshot) => {
        // This logic turns a JS Object into an array, per JS internals, order of object keys in the array is not guaranteed
        setLayouts(
          Object.keys(layouts).map((layoutName: string) => ({
            layoutName,
            layout: layouts[layoutName],
          }))
        );
      };

      // Not necessary for this example - to be called by OpenFin API internals
      // (i.e. replaceLayout API or to surface the corresponding layout when view.focus() is called)
      public showLayout = async (id: OpenFin.LayoutIdentity) => {
        if (id.layoutName) {
          const newIndex = layouts.findIndex(
            (x) => x.layoutName === id.layoutName
          );
          if (newIndex !== -1) {
            setCurrentActiveTab(newIndex);
          }
        }
      };
    };

  useEffect(() => {
    fin.Platform.Layout.init({ layoutManagerOverride });
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, index: number) => {
    // Active tab index state -> LayoutContainer "active" prop -> hidden state of container
    setCurrentActiveTab(Math.min(index, layouts.length - 1));
  };

  return (
    <div id="layout-container">
      <Box sx={{ width: "100%", height: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentActiveTab}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            sx={styles.tabContainer}
            TabIndicatorProps={{ sx: styles.tabIndicator }}
          >
            {layouts.map(({ layoutName }) => (
              <Tab sx={styles.tab} key={layoutName} label={layoutName} />
            ))}
          </Tabs>
        </Box>
        {layouts.map((layout, i) => (
          <LayoutContainer
            active={currentActiveTab === i}
            key={layout.layoutName}
            {...layout}
          />
        ))}
      </Box>
    </div>
  );
}

const LayoutContainer = ({
  layoutName,
  layout,
  active,
}: LayoutState & { active: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current!;
    fin.Platform.Layout.create({ container, layout, layoutName });
    return () => {
      const layoutIdentity = { layoutName, ...fin.me.identity };
      fin.Platform.Layout.destroy(layoutIdentity);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={active ? "" : "hidden"}
      style={styles.layoutContainer}
    ></div>
  );
};
