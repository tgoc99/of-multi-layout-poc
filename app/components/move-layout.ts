import OpenFin, { fin } from "@openfin/core";

/**
 * Tear a Layout out of the its current window, creating a new window that only includes the "tornout" Layout.
 * @param {LayoutIdentity} layoutIdentity Layout identity of the Layout to tearout
 */
export async function tearoutLayout(
  layoutIdentity: OpenFin.LayoutIdentity
): Promise<void> {
  const layoutSnapshot = {
    layouts: {
      [layoutIdentity.layoutName]: await fin.Platform.Layout.wrapSync(
        layoutIdentity
      ).getConfig(),
    },
  };

  await fin.Platform.getCurrentSync().createWindow({
    layoutSnapshot,
    reason: "tearout",
  });
}

/**
 * Transfers the views to the provider window, later to be stolen by the current window during Layout.create() call.
 * @param {LayoutIdentity} layoutIdentity Layout identity of the Layout to transfer to the current window
 * @returns {LayoutOptions} Layout from the source window to be passed to Layout.create()
 */
export async function transferLayout(
  layoutIdentity: OpenFin.LayoutIdentity
): Promise<OpenFin.LayoutOptions> {
  const originLayout = fin.Platform.Layout.wrapSync(layoutIdentity);
  // Do not allow inter-window transfer or transfer between applications.
  if (
    layoutIdentity.name === fin.me.identity.name ||
    layoutIdentity.uuid !== fin.me.identity.uuid
  ) {
    throw new Error("Cannot transfer this layout");
  }

  // Ensure we grab the config before modifying the layout.
  const layout = await originLayout.getConfig();

  const providerIdentity = { uuid: fin.me.uuid, name: fin.me.uuid };

  // Get origin Layout views.
  const layoutViews = await originLayout.getCurrentViews();
  // Re-parent origin Layout views to provider window, later to be stolen by the this window.
  // This is to ensure that the views from the source layout get re-used in Layout.create()
  await Promise.all(
    layoutViews.map((v: OpenFin.View) => v.attach(providerIdentity))
  );

  return layout;
}
