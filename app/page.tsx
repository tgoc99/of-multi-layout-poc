// @ts-nocheck
'use client';
import { Box, Tab, Tabs } from '@mui/material';
import OpenFin, { fin } from '@openfin/core';
import React, { CSSProperties, Component, ReactNode, useEffect, useRef } from 'react';

// '& svg': { height: '0.6em', width: '0.6em' }
const styles: Record<string, CSSProperties> = {
    tab: { padding: '4px 8px', minHeight: '28px', height: '28px' },
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
};

const makeOverride = (container: TabsContainer) => (Base: OpenFin.LayoutManagerConstructor<OpenFin.LayoutSnapshot>) =>
    class MTPOverride extends Base {

        applyLayoutSnapshot = async (snapshot: OpenFin.LayoutSnapshot): Promise<void> => {
            console.log(`applyLayoutSnapshot() called`);
            const { layouts } = snapshot;
            // save the counter for naming new tabs, we name our tabs 1-based so add 1
            container.setState({
                layouts: Object.keys(layouts).map((layoutName: string) => ({ layoutName, layout: layouts[layoutName] })),
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

export default class TabsContainer extends Component<{}, TabsContainerState> {
    state = {
        layouts: [] as LayoutState[],
        value: 0,
        lastActiveTab: 0,
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

    render(): ReactNode {
        return (
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
                                />
                            ))}

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
        fin.Platform.Layout.create({ container, layout, layoutName });
        return () => {
            fin.Platform.Layout.destroy({ layoutName });
        };
    }, []);

    return <div ref={containerRef} className={active ? '' : 'hidden'} style={styles.layoutConatiner}></div>;
};
