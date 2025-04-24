/**
 * ListDetail.jsx
 *
 * This file handles component position in the list-detail layout
 * See:
 *  - [Canonical layouts, List-detail](https://m3.material.io/foundations/layout/canonical-layouts/list-detail)
 */
import { PanelGroup, Panel } from "react-resizable-panels";

import { Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { name as APP_NAME } from "../../package.json";
import PanelResizeHandle from "./PanelResizeHandle";

const FIRST_PANE_MIN = 20; // size before hidden
const FIRST_PANE_MAX = 75; // maximum size of sidebar
const FIRST_PANE_DEFAULT = 50; // size on page load

const LAYOUT_ID = "roundup-list-detail-layout";

export default function ListDetail({ navigation, firstPane, secondPane }) {
  return (
    <Grid container spacing={1}>
      <Grid size={12} sx={{ borderBottom: "1px solid #ddd" }}>
        {APP_NAME}
      </Grid>
      <Grid
        size={1}
        sx={{
          height: "100vh",
        }}
      >
        {navigation}
      </Grid>
      <Grid size={11} sx={{ padding: "10px" }}>
        <PanelGroup autoSaveId={LAYOUT_ID} direction="horizontal">
          <Panel
            collapsible={true}
            minSize={FIRST_PANE_MIN}
            defaultSize={FIRST_PANE_DEFAULT}
            maxSize={FIRST_PANE_MAX}
            order={1}
            style={{
              height: "100vh",
            }}
            // onResize={(size) => dispatch(setFirstPaneWidth(size))}
          >
            {firstPane}
          </Panel>
          <PanelResizeHandle />
          <Panel order={2}>
            <Paper
              sx={{
                borderRadius: "5px",
                padding: "10px",
                height: "100vh",
              }}
            >
              {secondPane}
            </Paper>
          </Panel>
        </PanelGroup>
      </Grid>
    </Grid>
  );
}
