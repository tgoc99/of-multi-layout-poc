// @ts-nocheck
'use client';
import { Box, Tab, Tabs } from '@mui/material';
import OpenFin, { fin } from '@openfin/core';
import React, { CSSProperties, Component, ReactNode, useEffect, useRef } from 'react';

// '& svg': { height: '0.6em', width: '0.6em' }
const styles: Record<string, CSSProperties> = {
    iconButton: { padding: '4px' },
    smallIcon: { fontSize: 14 },
    tab: { padding: '4px 8px', minHeight: '28px', height: '28px' },
    // get addTab() {
    //     return { ...this.tab, minWidth: '32px', width: '32px', borderLeft: '1px solid #999' };
    // },
    tabIndicator: { transition: 'all 0.08s linear' },
    tabContainer: { minHeight: '32px', height: '32px', padding: 0 },
    layoutConatiner: { height: '100%', width: '100%', overflow: 'hidden' }
};

type LayoutState = {
    layoutName: string;
    layout: OpenFin.LayoutOptions;
};

type TabsContainerState = {
    value: number;
    lastActiveTab: number;
    layouts: LayoutState[];
    nextTabValue: number;
    initialLayout: OpenFin.LayoutOptions;
};

type TabsSnapshot = OpenFin.LayoutSnapshot & {
    order?: string[];
};

// TODO:
// current impl as is
// new file for reduced impl (no order, least amount of code, component class)
// new file for FC reduced impl

const makeOverride = (container: TabsContainer) => (Base: OpenFin.LayoutManagerConstructor<OpenFin.LayoutSnapshot>) =>
    class MTPOverride extends Base {
        private checkOrder = (snapshot: TabsSnapshot) => {
            if (!snapshot.order) return Object.keys(snapshot.layouts);
            // Check that all keys in order are on the layouts and all layouts are in order
            if (
                snapshot.order.filter((x: string) => !!snapshot.layouts[x]).length !==
                Object.keys(snapshot.layouts).length
            ) {
                return Object.keys(snapshot.layouts);
            }
            return snapshot.order;
        };

        async getLayoutSnapshot(): Promise<TabsSnapshot> {
            console.log(`getLayoutSnapshot() called`);
            const base = await super.getLayoutSnapshot();
            const order = container.state.layouts.map((x) => x.layoutName).filter((x) => !!base.layouts[x]);
            return { ...base, order };
        }

        applyLayoutSnapshot = async (snapshot: TabsSnapshot): Promise<void> => {
            console.log(`applyLayoutSnapshot() called`);
            const order = this.checkOrder(snapshot);
            const { layouts } = snapshot;
            const initialLayout = {
                type: 'stack',
                content: [
                    {
                        type: 'component',
                        componentName: 'view',
                        componentState: {
                            url: 'http://localhost:3000/'
                        }
                    }
                ]
            };
            // save the counter for naming new tabs, we name our tabs 1-based so add 1
            const nextTabValue = Object.keys(layouts).length + 1;
            container.setState({
                layouts: order.map((layoutName: string) => ({ layoutName, layout: layouts[layoutName] })),
                // TODO: consider `layoutTemplate` manifest key? For now, use first layout
                initialLayout,
                nextTabValue
            });
            console.log(`state has been set`);
        };

        public showLayout = async (id: OpenFin.LayoutIdentity) => {
            if (id.layoutName) {
                container.setState((s) => {
                    const newIndex = s.layouts.findIndex((x) => x.layoutName === id.layoutName);
                    return {
                        value: newIndex !== 1 ? newIndex : s.value
                    };
                });
            }
        };
    };

export default class TabsContainer extends Component<{ show: boolean }, TabsContainerState> {
    state = {
        layouts: [] as LayoutState[],
        value: 0,
        lastActiveTab: 0,
        nextTabValue: 0,
        initialLayout: {} as OpenFin.LayoutOptions
    };

    componentDidMount(): void {
        console.log(`--- before layout init`);
        fin.Platform.Layout.init({ layoutManagerOverride: makeOverride(this) });
        console.log(`--- after layout init`);
    }

    private handleTabChange = (_: React.SyntheticEvent, index: number) => {
        this.setState((s) => {
            const state = {
                value: Math.min(index, s.layouts.length - 1),
                lastActiveTab: Math.min(s.value, s.layouts.length - 1)
            };
            console.log(`handleTabChange`, { ...state, ...s.layouts });
            return state;
        });
    };

    // private handleTabClose = (ev: React.SyntheticEvent, layoutName: string, index: number) => {
    //     // prevent tab change logic
    //     ev.stopPropagation();
    //     this.setState((s) => {
    //         const layouts = s.layouts.filter((l) => l.layoutName !== layoutName);
    //         let value = s.value;
    //         let lastActiveTab = s.lastActiveTab;
    //         if (index < value) {
    //             // if closed to the left, subtract 1
    //             value = Math.max(0, value - 1);
    //             lastActiveTab = Math.max(0, lastActiveTab - 1);
    //         } else if (index === value) {
    //             // if active tab is closed, show lastActiveTab constrained to [0,length]
    //             value = Math.max(0, Math.min(s.lastActiveTab, layouts.length - 1));
    //             // TODO: should we just maintain a stack of last tabs to simplify this
    //             // subtract 1 from lastActiveTab, constrainted to [0,length]
    //             lastActiveTab = Math.max(0, Math.min(s.lastActiveTab - 1, layouts.length - 1));
    //         } else {
    //             // if closed to the right, reset lastActiveTab constrained to [0,length]
    //             lastActiveTab = Math.max(0, Math.min(s.lastActiveTab, layouts.length - 1));
    //         }

    //         const state = { layouts, value, lastActiveTab };
    //         console.log(`handleClose`, { ...state, ...layouts });
    //         return state;
    //     });
    // };

    // private handleTabAdd = async (ev: React.SyntheticEvent) => {
    //     // prevent tab change logic
    //     ev.preventDefault();

    //     this.setState((s) => {
    //         // use initialLayout as template
    //         const layouts = [
    //             ...s.layouts,
    //             {
    //                 layout: s.initialLayout,
    //                 layoutName: 'tab' + s.nextTabValue
    //             }
    //         ];
    //         const value = layouts.length - 1;
    //         const state = { layouts, nextTabValue: s.nextTabValue + 1, value, lastActiveTab: s.value };
    //         console.log(`handleAdd`, { ...state, ...layouts });
    //         return state;
    //     });
    // };

    render(): ReactNode {
        return (
            // <div id="layout-container" className={this.props.show ? '' : 'hidden'}>
            <div id="layout-container" >
                <Box sx={{ width: '100%', height: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={this.state.value}
                            onChange={this.handleTabChange}
                            aria-label="basic tabs example"
                            sx={styles.tabContainer}
                            TabIndicatorProps={{ sx: styles.tabIndicator }}
                        >
                            {this.state.layouts.map(({ layoutName }, i) => (
                                <Tab
                                    sx={styles.tab}
                                    key={layoutName}
                                    label={layoutName}
                                    // iconPosition="end"
                                    // icon={
                                    //     <IconButton sx={styles.iconButton}>
                                    //         <Close
                                    //             sx={styles.smallIcon}
                                    //             onClick={(ev) => this.handleTabClose(ev, layoutName, i)}
                                    //         />
                                    //     </IconButton>
                                    // }
                                />
                            ))}
                            {/* <Box sx={styles.addTab}> */}
                                {/* <IconButton sx={styles.iconButton} onClick={this.handleTabAdd}>
                                    <Add sx={styles.smallIcon} />
                                </IconButton> */}
                            {/* </Box> */}
                        </Tabs>
                    </Box>
                    {this.state.layouts.map((layout, i) => (
                        <LayoutContainer active={this.state.value === i} key={layout.layoutName} {...layout} />
                    ))}
                </Box>
            </div>
        );
    }
}

type LayoutContainerProps = LayoutState & { active: boolean };

const LayoutContainer = ({ layoutName, layout, active }: LayoutContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const container = containerRef.current!;
        console.log(`layout-container::${layoutName} before create()`);
        fin.Platform.Layout.create({ container, layout, layoutName });
        console.log(`layout-container::${layoutName} after create()`);
        return () => {
            console.log(`layout-container::${layoutName} before destroy()`);
            fin.Platform.Layout.destroy({ layoutName });
            console.log(`layout-container::${layoutName} after destroy()`);
        };
    }, []);

    return <div ref={containerRef} className={active ? '' : 'hidden'} style={styles.layoutConatiner}></div>;
};


// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24">
//       <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
//         <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
//           Get started by editing&nbsp;
//           <code className="font-mono font-bold">app/page.tsx</code>
//         </p>
//         <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
//           <a
//             className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
//             href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             By{' '}
//             <Image
//               src="/vercel.svg"
//               alt="Vercel Logo"
//               className="dark:invert"
//               width={100}
//               height={24}
//               priority
//             />
//           </a>
//         </div>
//       </div>

//       <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
//         <Image
//           className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
//           src="/next.svg"
//           alt="Next.js Logo"
//           width={180}
//           height={37}
//           priority
//         />
//       </div>

//       <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
//         <a
//           href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Docs{' '}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             Find in-depth information about Next.js features and API.
//           </p>
//         </a>

//         <a
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Learn{' '}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             Learn about Next.js in an interactive course with&nbsp;quizzes!
//           </p>
//         </a>

//         <a
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Templates{' '}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             Explore the Next.js 13 playground.
//           </p>
//         </a>

//         <a
//           href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Deploy{' '}
//             <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
//               -&gt;
//             </span>
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             Instantly deploy your Next.js site to a shareable URL with Vercel.
//           </p>
//         </a>
//       </div>
//     </main>
//   )
// }
