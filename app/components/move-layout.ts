import OpenFin, { fin } from "@openfin/core";
import { LayoutIdentity } from './types';

/**
 * Tear a Layout out of the its current window, creating a new window that only includes the "tornout" Layout.
 * @param {LayoutIdentity} layoutIdentity Layout identity of the Layout to tearout
 */
export async function tearoutLayout(layoutIdentity: LayoutIdentity): Promise<void> {
    const layoutSnapshot = {
        layouts: {
            [layoutIdentity.layoutName]: await fin.Platform.Layout.wrapSync(layoutIdentity).getConfig(),
        }
    }

    await fin.Platform.getCurrentSync().createWindow({ layoutSnapshot, reason: 'tearout' });
}

/**
 * Move an existing Layout from another window to the current window.
 * @param {LayoutIdentity} layoutIdentity Layout identity of the Layout to transfer to the current window
 */
export async function transferLayout(layoutIdentity: LayoutIdentity): Promise<void> {
    const originLayout = fin.Platform.Layout.wrapSync(layoutIdentity);
    // Do not allow inter-window transfer or transfer between applications
    if (layoutIdentity.name === fin.me.identity.name || layoutIdentity.uuid !== fin.me.identity.uuid) {
        return;
    }
    // Get origin Layout views
    const layoutViews = await originLayout.getCurrentViews();
    // Re-parent origin Layout views target 
    await Promise.all(layoutViews.map((v: OpenFin.View) => v.attach(fin.me.identity)));
}
