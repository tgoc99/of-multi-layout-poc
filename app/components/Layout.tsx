import { fin } from "@openfin/core";
import { useRef, useEffect } from "react";
import { LayoutState, styles } from "./types";

type LayoutProps = LayoutState & { active: boolean };

/**
 * The div container for a single layout. Responsible for creating
 * itself and destroying itself via fin.Platform.Layout APIs.
 */
export const Layout = ({ layoutName, layout, active }: LayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current!;
    fin.Platform.Layout.create({ container, layout, layoutName });
    return () => {
      const layoutIdentity = { layoutName, ...fin.me.identity };
      fin.Platform.Layout.destroy(layoutIdentity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to ensure this only runs once

  // Use className=hidden when this layout is not active
  return (
    <div
      ref={containerRef}
      className={active ? "" : "hidden"}
      style={styles.layoutContainer}
    ></div>
  );
};
