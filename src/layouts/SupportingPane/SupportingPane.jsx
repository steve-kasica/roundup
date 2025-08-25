// /**
//  * SuppotingPane.jsx
//  *
//  * This file handles component position in the suppoting pane layout
//  * See:
//  *  - [Canonical layouts, Suppoting pane](https://m3.material.io/foundations/layout/canonical-layouts/supporting-pane)
//  */

import Grid from "@mui/material/Grid2";
import { useState } from "react";
// import { Panel, PanelGroup } from "react-resizable-panels";
import { name as APP_NAME } from "../../../package.json";
import TableSelector from "../../components/TableSelector";
import CompositeTableSchema from "../../components/CompositeTableSchema";
import MainContent from "./MainContent";
import { Typography, Box } from "@mui/material";
import OperationsList from "../../components/OperationsList";
import Toolbar from "./Toolbar";
import ModalDialog from "./ModalDialog";
import AppDrawer from "./AppDrawer";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DragIndicator } from "@mui/icons-material";
// import { Paper } from "@mui/material";
// import PanelResizeHandle from "./PanelResizeHandle";
// import { useDispatch } from "react-redux";
// import { setFirstPaneWidth } from "../data/uiSlice";

const PRIMARY_PANEL_MIN = 20;
const PRIMARY_PANEL_DEFAULT = 30;
const PRIMARY_PANEL_MAX = 50;

const SIDE_PANEL_WIDTH = 4; // 1/3 of the grid
const MAIN_PANEL_WIDTH = 12 - SIDE_PANEL_WIDTH;

export default function SupportingPane() {
  const [firstPanelWidth, setFirstPanelWidth] = useState(PRIMARY_PANEL_DEFAULT);
  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12} sx={{ borderBottom: "1px solid #ddd" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="div">
              {APP_NAME}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Toolbar />
            </Box>
          </Box>
        </Grid>
        <PanelGroup autoSaveId={"SupportingPane"} direction="horizontal">
          <Panel
            collapsible={true}
            minSize={10}
            defaultSize={50}
            maxSize={75}
            order={1}
            style={{ height: "100vh" }}
          >
            <TableSelector />
            <OperationsList />
            <CompositeTableSchema />
          </Panel>
          <PanelResizeHandle
            style={{
              cursor: "col-resize",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DragIndicator
              sx={{
                cursor: "col-resize",
                transition:
                  "transform .12s ease, color .12s ease, opacity .12s ease",
                opacity: 0.7,
                "&:hover": {
                  transform: "scale(1.25)",
                  color: "primary.main",
                  opacity: 1,
                },
              }}
              aria-hidden={false}
              aria-label="resize handle"
            />
          </PanelResizeHandle>
          <Panel order={2}>
            <MainContent />
          </Panel>
        </PanelGroup>
      </Grid>
      <ModalDialog />
      <AppDrawer open={false} />
    </>
  );
  // {
  //   /* <PandelGroup autoSaveId={LAYOUT_ID} direction="horizontal">
  //         <Panel
  //           collapsible={true}
  //           minSize={PRIMARY_PANEL_MIN}
  //           defaultSize={PRIMARY_PANEL_DEFAULT}
  //           maxSize={PRIMARY_PANEL_MAX}
  //           order={1}
  //           style={{ height: "100vh" }}
  //           onResize={(size) => dispatch(setFirstPaneWidth(size))}
  //         >
  //           <Paper
  //             sx={{
  //               borderRadius: "5px",
  //               padding: "10px",
  //               // height: "100vh"
  //             }}
  //           >
  //             {primaryContent}
  //           </Paper>
  //         </Panel>
  //         <PanelResizeHandle />
  //         <Panel order={2}>
  //           <Paper
  //             sx={{
  //               borderRadius: "5px",
  //               padding: "10px",
  //               // height: "100vh"
  //             }}
  //           >
  //             {secondaryContent}
  //           </Paper>
  //         </Panel>
  //       </PanelGroup> */
  // }
  // //     </Grid>
  // //   </Grid>
  // // );
}
