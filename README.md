# OpenFin Multi-Layouts APIs

This is an example of OpenFin Multi-Layout APIs. It was created as a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). An OpenFin app manifest was added at public/multi-layout.json. We are using the default platform provider (no HTML/js in this project for the platform provider). The logic for the platform window is in the `app` folder. All of the multi-layout logic is in `TabsContainer.tsx`.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, build the Next.js app:

```bash
npm run build
```

Then, start the HTTP server:

```bash
npm start
```

Then, in a seperate terminal, launch the OpenFin platform:

```bash
npm run launch
```

This will launch the OpenFin platform, which will open up a single platform window as described in the manifest that contains 3 different layouts. In order to create another window with multiple layouts, you can run `fin.Platform.getCurrentSync().createWindow()` with [window options](https://developer.openfin.co/docs/tsdoc/canary/interfaces/OpenFin.WindowCreationOptions.html) that includes a [layoutSnapshot](https://developer.openfin.co/docs/tsdoc/canary/interfaces/OpenFin.WindowCreationOptions.html#layoutSnapshot).

## Visibility CSS

It is recommended to use `display: none` CSS setting to hide the divs for all inactive layouts. (We do not have anything planned for supporting `visibility: hidden` at this time.)

## Primary APIs

- `fin.Platform.Layout.init({ layoutManagerOverride })`
- `fin.Platform.Layout.create({ layoutName, layout, container })`
- `fin.Platform.Layout.destroy(layoutIdentity)`

# Optimizing content for Tabs

This repository demonstrates how usage of our new Multi-Layout API can improve your application’s layout switching performance, compared to usage of Layout.replace(). Content does not have to re-render in our Multi-Layout implementation, which results in significant visual and performance improvements when switching between Layouts.

### Process Affinity

By default, OpenFin Views share the same process affinity with other same-origin Views. This means that they share the same execution context (both main thread and memory). Given JavaScript’s single-threaded nature, rendering of multiple Views that share the same process affinity can lead to bottlenecks during memory-intensive operations, such as during creation, heavy user interaction, and – most relevant to this demo – tab switching.

That is why we recommend a new renderer process for every View in your Layout. You can achieve this by setting the key `platform.viewProcessAffinityStrategy` to “different” in the `platform` options in your manifest. (See [processAffinity docs](https://developer.openfin.co/docs/tsdoc/canary/interfaces/OpenFin.PlatformOptions.html#viewProcessAffinityStrategy)):

<i>app.manifest.json:</i>

```json
{
  ...
  "platform": {
    "uuid": "my-application-id",
    "name": "my-application-name",
    "viewProcessAffinityStrategy": "different",
    ...
  }
}
```

This will ensure that every View created in the Platform will have its own Renderer Process, which should increase performance across the board, because memory and process space will no longer be shared among same-origin Views.

### Controlling for Application Content

Performance and rendering speed of the View content itself is just as important as the methodology used to transition from tab to tab. Web development best practices apply here, and a good resource is [Chrome’s Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/). A performance score of < 80 can impact the performance or perceived performance of your application, especially when your Layout has a significant number of Views.

We also recommend that you set the background color of your application content to match the background color of the Platform Window. This ensures that, even if the View content is in the process of loading, the UI will remain cohesive to the end user.

Additionally, be aware that your content could be doing something that forces re-renders. One example is an application using the [visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) event to re-render content. This is not a best practice, and can be found in web applications such as TradingView.

### Resource-constrained Machines

The Chromium engine employs a number of optimization techniques when running on machines with constrained resources. One of these optimizations involves reducing the total number of render processes, thereby forcing a number of applications into the same Process affinity.

In extreme cases, you can experience dropping frames. This can be particularly noticeable on VMs with limited memory and CPUs, and no GPUs - as in [this video example](https://www.loom.com/share/8be3f7cf4dd44a8fa77cd008e20c4576?sid=29e1ea87-aa1c-4ce0-9d24-89c05636d5f0).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
