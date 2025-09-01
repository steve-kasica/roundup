// /**
//  * SuppotingPane.jsx
//  *
//  * This file handles component position in the suppoting pane layout
//  * See:
//  *  - [Canonical layouts, Suppoting pane](https://m3.material.io/foundations/layout/canonical-layouts/supporting-pane)
//  */

import { name as APP_NAME } from "../../../package.json";
import MainContent from "./MainContent";
import { styled, Typography, Box } from "@mui/material";
import Toolbar from "./Toolbar";
import ModalDialog from "./ModalDialog";
import AppDrawer from "./AppDrawer";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DragIndicator } from "@mui/icons-material";
import LeftSideBar from "./LeftSideBar";

// styled wrapper so we can apply hover styles inline (no external CSS required)
const StyledPanelResizeHandle = styled(PanelResizeHandle)(() => ({
  width: "2px",
  cursor: "col-resize",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  transition: "background 0.12s ease, box-shadow 0.12s ease",
  // show blue bar on hover/active
  "&:hover, &:active": {
    background: "rgba(10, 50, 160, 1)",
    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.03)",
  },
}));

export default function SupportingPane() {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          borderBottom: "1px solid #ddd",
          padding: "8px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" component="div">
          {APP_NAME}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Toolbar />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <PanelGroup autoSaveId={"SupportingPane"} direction="horizontal">
          <Panel
            collapsible={true}
            minSize={10}
            defaultSize={50}
            maxSize={75}
            order={1}
          >
            <LeftSideBar />
          </Panel>
          <StyledPanelResizeHandle />
          <Panel order={2}>
            <MainContent />
          </Panel>
        </PanelGroup>
      </Box>

      <ModalDialog />
      <AppDrawer open={false} />
    </Box>
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
