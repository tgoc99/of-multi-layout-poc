"use client";
import { Box, Tab, Tabs } from "@mui/material";
import OpenFin, { fin } from "@openfin/core";
import React, { useEffect } from "react";
import { Layout } from "./Layout";
import { LayoutState, styles } from "./types";

/**
 * The div container providing a Tabbed interface of layouts.
 * Responsible for initializing the platform layout with an overridden
 * LayoutManager via fin.Platform.Layout APIs.
 * See the {@link OpenFin.LayoutManager} LayoutManager type for docs (navigate to the symbol).
 * You can also navigate to or hover over the overridden methods for more details.
 */
export const LayoutContainer = () => {
  const [layoutState, setLayoutState] = React.useState<LayoutState[]>([]);
  const [currentActiveTab, setCurrentActiveTab] = React.useState<number>(0);

  const layoutManagerOverride = (
    Base: OpenFin.LayoutManagerConstructor<OpenFin.LayoutSnapshot>
  ) =>
    class TabLayoutManager extends Base {
      // OpenFin internals call this method during layout initialization, here we use it to set our React state
      applyLayoutSnapshot = async ({ layouts }: OpenFin.LayoutSnapshot) => {
        // This logic turns a JS Object into an array, per JS internals, order of object keys in the array is not guaranteed
        setLayoutState(
          Object.keys(layouts).map((layoutName: string) => ({
            layoutName,
            layout: layouts[layoutName],
          }))
        );
      };

      // Not necessary for this example - to be called by OpenFin API internals
      // (i.e. replaceLayout API or to show the corresponding layout when view.focus() is called)
      public showLayout = async (id: OpenFin.LayoutIdentity) => {
        if (id.layoutName) {
          const newIndex = layoutState.findIndex(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to ensure this only runs once

  const handleTabChange = (_: React.SyntheticEvent, index: number) => {
    // Constrain active tab to [0,layoutsLength]. This is used by
    // LayoutContainer to decide whether to show or hide the layout.
    setCurrentActiveTab(Math.min(index, layoutState.length - 1));
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
            {layoutState.map(({ layoutName }) => (
              <Tab sx={styles.tab} key={layoutName} label={layoutName} />
            ))}
          </Tabs>
        </Box>
        {layoutState.map((layout, i) => (
          <Layout
            active={currentActiveTab === i}
            key={layout.layoutName}
            {...layout}
          />
        ))}
      </Box>
    </div>
  );
};
