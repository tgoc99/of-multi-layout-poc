This is an example of OpenFin multi-layouts. It was created as a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). An OpenFin app manifest was added at public/multi-layout.json. We are using the default platform provider (no HTML/js in this project for the platform provider). The logic for the platform window is in the `app` folder. All of the multi-layout logic is in `TabsContainer.tsx`.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
