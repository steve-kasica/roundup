/**
 * SuppotingPane.jsx
 * 
 * This file handles component position in the suppoting pane layout
 * See:
 *  - [Canonical layouts, Suppoting pane](https://m3.material.io/foundations/layout/canonical-layouts/supporting-pane)
 */

import Grid from "@mui/material/Grid2";
import { Panel, PanelGroup } from "react-resizable-panels";
import {name as APP_NAME} from "../../package.json"
import { Paper } from "@mui/material";
import PanelResizeHandle from "./PanelResizeHandle";

const PRIMARY_PANEL_MIN = 20;
const PRIMARY_PANEL_DEFAULT = 30;
const PRIMARY_PANEL_MAX = 50;

const LAYOUT_ID = "roundup-suppoting-pane-layout";

export default function SuppotingPane({
    navigation,
    primaryContent,
    secondaryContent
}) {
    return (
        <Grid container spacing={1}>
            <Grid size={12} sx={{borderBottom: "1px solid #ddd"}}>
                {APP_NAME}
            </Grid>
            <Grid size={1} sx={{
                height: "100vh"
            }}>
              {navigation}
            </Grid>
            <Grid size={11} sx={{padding: "10px"}}>
                <PanelGroup
                    autoSaveId={LAYOUT_ID}
                    direction="horizontal"
                >
                    <Panel
                        collapsible={true}
                        minSize={PRIMARY_PANEL_MIN}
                        defaultSize={PRIMARY_PANEL_DEFAULT}
                        maxSize={PRIMARY_PANEL_MAX}
                        order={1}
                        style={{height: "100vh"}}
                    >
                        <Paper sx={{
                            borderRadius: "5px",
                            padding: "10px",
                            height: "100vh"
                        }}>
                            {primaryContent}
                        </Paper>
                    </Panel>
                    <PanelResizeHandle />
                    <Panel order={2}>
                        <Paper sx={{
                            borderRadius: "5px",
                            padding: "10px",
                            height: "100vh"
                        }}>
                            {secondaryContent}
                        </Paper>
                    </Panel>
                </PanelGroup>
            </Grid>
        </Grid>
    )
}