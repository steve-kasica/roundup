// /**
//  * SuppotingPane.jsx
//  *
//  * This file handles component position in the suppoting pane layout
//  * See:
//  *  - [Canonical layouts, Suppoting pane](https://m3.material.io/foundations/layout/canonical-layouts/supporting-pane)
//  */

import { name as APP_NAME } from "../../../package.json";
import MainContent from "./MainContent";
import { Typography, Box } from "@mui/material";
import Toolbar from "./Toolbar";
import ModalDialog from "./ModalDialog";
import AppDrawer from "./AppDrawer";
import { Panel, PanelGroup } from "react-resizable-panels";
import LeftSideBar from "./LeftSideBar";
import { useSelector } from "react-redux";
import { selectAllTablesData } from "../../slices/tablesSlice";
import StyledPanelResizeHandle from "./PanelResizeHandle";

export default function SupportingPane() {
  const tables = useSelector(selectAllTablesData);
  const isOpen = tables.length > 0;
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
        {/* If there are no uploaded tables, show the left sidebar at full width */}
        {!isOpen ? (
          <Box sx={{ height: "100%", width: "100%", overflow: "auto" }}>
            <LeftSideBar />
          </Box>
        ) : (
          <PanelGroup autoSaveId={"SupportingPane"} direction="horizontal">
            <Panel
              collapsible={true}
              minSize={10}
              defaultSize={25}
              maxSize={100}
              order={1}
            >
              <LeftSideBar />
            </Panel>
            <StyledPanelResizeHandle>
              {/* visible indicator can be added here if desired */}
            </StyledPanelResizeHandle>
            <Panel order={2}>
              <MainContent />
            </Panel>
          </PanelGroup>
        )}
      </Box>

      <ModalDialog />
      <AppDrawer open={false} />
    </Box>
  );
}
