"use client";
import { Box, IconButton, Tab, Tabs, TextField } from "@mui/material";
import {
  Close,
  Add,
  OpenInNew,
  SystemUpdateAlt,
  Shuffle,
  CopyAll,
} from "@mui/icons-material";
import OpenFin, { fin } from "@openfin/core";
import React, { useEffect } from "react";
import { Layout } from "./Layout";
import { DEFAULT_LAYOUT, LayoutState, styles } from "./types";
import { tearoutLayout, transferLayout } from "./move-layout";

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
  const [layoutIdentityToTransfer, setLayoutIdentityToTransfer] =
    React.useState<string>();

  const layoutManagerOverride = (
    Base: OpenFin.LayoutManagerConstructor<OpenFin.LayoutSnapshot>
  ) =>
    class TabLayoutManager extends Base {
      /**
       * OpenFin internals call this method during initialization.
       * Here we use it to set our initial Layout state, resulting in Layout components
       * being created for each Layout that call `fin.Platform.Layout.create()` on mount.
       */
      applyLayoutSnapshot = async ({ layouts }: OpenFin.LayoutSnapshot) => {
        // This logic converts JS Object into an array, per JS internals, order of object keys in the array is not guaranteed.
        setLayoutState(
          Object.keys(layouts).map((layoutName: string) => ({
            layoutName,
            layout: layouts[layoutName],
          }))
        );
      };

      /**
       * Called by OpenFin API internals when the last view is removed from a Layout.
       * Removing the Layout from state in this override results in the Layout
       * component unmounting which triggers `fin.Platform.Layout.destroy()` as a result
       * of the Layout useEffect hook cleanup.
       */
      removeLayout = async (id: OpenFin.LayoutIdentity) => {
        if (id.layoutName) {
          setLayoutState((prev) =>
            prev.filter((x) => x.layoutName !== id.layoutName)
          );

          // Update the index of the active tab.
          setCurrentActiveTab(
            currentActiveTab < layoutState.length
              ? currentActiveTab
              : Math.max(0, currentActiveTab - 1)
          );
        }
      };

      // Not necessary for this example - to be called by OpenFin API internals.
      // (i.e. replaceLayout API or to show the corresponding Layout when view.focus() is called)
      showLayout = async (id: OpenFin.LayoutIdentity) => {
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
    // the Layout component to decide whether to show or hide.
    setCurrentActiveTab(Math.min(index, layoutState.length - 1));
  };

  const handleTabAdd = async (ev: React.SyntheticEvent) => {
    // Prevent tab change logic.
    ev.stopPropagation();

    const { generate } = await import("random-words");

    const newLayoutState = {
      layoutName: generate(1)[0],
      layout: DEFAULT_LAYOUT,
    };
    // Add new Layout to state resulting in Layout component rendering which calls `fin.Platform.Layout.create` as a result of the useEffect hook.
    setLayoutState((prev) => [...prev, newLayoutState]);
    // Update the index of the active tab.
    setCurrentActiveTab(layoutState.length);
  };

  const handleTabClose = (
    ev: React.SyntheticEvent,
    layoutName: string,
    index: number
  ) => {
    // Prevent tab change logic.
    ev.stopPropagation();

    // Update the index of the active tab.
    setCurrentActiveTab(
      currentActiveTab < index
        ? currentActiveTab
        : Math.max(0, currentActiveTab - 1)
    );

    // This will unmount the component and trigger `fin.Platform.Layout.destroy()` as a result of the Layout useEffect hook cleanup.
    setLayoutState((prev) => prev.filter((ls) => ls.layoutName !== layoutName));
  };

  // Re-orders the Layouts in this window randomly by shuffling Layout state.
  const handleShuffleLayouts = (_: React.SyntheticEvent) => {
    setLayoutState((prev) => [...prev.sort(() => Math.random() - 0.5)]);
  };

  // Check all other windows for a Layout with the entered name and transfer to this window if a match is found.
  const handleTransferLayout = async (_: React.SyntheticEvent) => {
    if (layoutIdentityToTransfer) {
      const layoutIdentity = JSON.parse(
        layoutIdentityToTransfer
      ) as OpenFin.LayoutIdentity;

      // This util does everything to prepare popping in the views, except Layout.create()
      const layout = await transferLayout(layoutIdentity);

      // Add new Layout to state resulting in Layout component rendering which calls `fin.Platform.Layout.create` on mount.
      // Note that since all the views are now attached to this window, and we use Layout.create with the config from
      // the call to layout.getConfig() - the layout will correctly place all the views organized the same way.
      setLayoutState((prev) => [
        ...prev,
        {
          layoutName: layoutIdentity.layoutName,
          layout,
        },
      ]);
      // Update the index of the active tab.
      setCurrentActiveTab(layoutState.length);

      // clear the text field
      setLayoutIdentityToTransfer("");
    }
  };

  // Tearout the currently active Layout into its own window.
  const handleTearoutLayout = async (_: React.SyntheticEvent) => {
    const layoutIdentity = {
      ...fin.me.identity,
      layoutName: layoutState[currentActiveTab].layoutName,
    };
    await tearoutLayout(layoutIdentity);
    setCurrentActiveTab(0);
  };

  return (
    <div id="layout-container">
      <Box sx={{ width: "100%", height: "100%" }}>
        <Box sx={styles.tabControlsContainer}>
          <IconButton
            sx={styles.iconButton}
            title="add tab"
            onClick={handleTabAdd}
          >
            <Add sx={styles.smallIcon} />
          </IconButton>
          <IconButton
            sx={styles.iconButton}
            title="shuffle tabs"
            onClick={handleShuffleLayouts}
          >
            <Shuffle sx={styles.smallIcon} fontSize="inherit" />
          </IconButton>
          <IconButton
            sx={styles.iconButton}
            title="tearout active layout"
            onClick={handleTearoutLayout}
          >
            <OpenInNew sx={styles.smallIcon} fontSize="inherit" />
          </IconButton>
          <TextField
            sx={{ padding: "4px" }}
            InputProps={{ sx: { height: "20px" } }}
            placeholder="layoutIdentity"
            variant="outlined"
            value={layoutIdentityToTransfer}
            onChange={(e) => setLayoutIdentityToTransfer(e.target.value)}
          />
          <IconButton
            sx={styles.iconButton}
            title="transfer layout by layout identity"
            onClick={handleTransferLayout}
          >
            <SystemUpdateAlt sx={styles.smallIcon} fontSize="inherit" />
          </IconButton>
          <IconButton
            sx={styles.iconButton}
            title="copy active layout identity"
            onClick={() =>
              fin.Clipboard.writeText({
                data: JSON.stringify({
                  ...fin.me.identity,
                  layoutName: layoutState[currentActiveTab].layoutName,
                }),
              })
            }
          >
            <CopyAll sx={styles.smallIcon} fontSize="inherit" />
          </IconButton>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentActiveTab}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            sx={styles.tabContainer}
            TabIndicatorProps={{ sx: styles.tabIndicator }}
          >
            {layoutState.map(({ layoutName }, i) => (
              <Tab
                sx={styles.tab}
                key={layoutName}
                label={layoutName}
                iconPosition="end"
                icon={
                  <IconButton sx={styles.iconButton}>
                    <Close
                      sx={styles.smallIcon}
                      onClick={(ev) => handleTabClose(ev, layoutName, i)}
                    />
                  </IconButton>
                }
              />
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
