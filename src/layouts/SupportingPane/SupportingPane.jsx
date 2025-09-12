// /**
//  * SuppotingPane.jsx
//  *
//  * This file handles component position in the suppoting pane layout
//  * See:
//  *  - [Canonical layouts, Suppoting pane](https://m3.material.io/foundations/layout/canonical-layouts/supporting-pane)
//  */

import { name as APP_NAME } from "../../../package.json";
import MainContent from "./MainContent";
import { Typography, Box, styled } from "@mui/material";
import Toolbar from "./Toolbar";
import ModalDialog from "./ModalDialog";
import AppDrawer from "./AppDrawer";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import LeftSideBar from "./LeftSideBar";
import { useSelector } from "react-redux";
import { selectAllTablesData } from "../../slices/tablesSlice";
import CompositeTableSchema from "../../components/CompositeTableSchema";
import RightSidebar from "./RightSidebar";
import BottomPane from "./BottomPane";

const StyledPanelResizeHandle = styled(PanelResizeHandle)(() => ({
  width: "2px",
  cursor: "col-resize",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ccc",
  transition: "background 0.12s ease, box-shadow 0.12s ease",
  // show blue bar on hover/active
  "&:hover, &:active": {
    background: "rgba(10, 185, 255, 1)",
    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.03)",
  },
}));

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
          <PanelGroup autoSaveId="SupportingPane" direction="horizontal">
            <Panel
              collapsible={true}
              minSize={10}
              defaultSize={25}
              maxSize={100}
              order={1}
            >
              <PanelGroup autoSaveId="LeftSidebarPane" direction="vertical">
                <Panel
                  collapsible={true}
                  minSize={10}
                  defaultSize={75}
                  maxSize={100}
                  order={1}
                >
                  <LeftSideBar />
                </Panel>
                <StyledPanelResizeHandle
                  sx={{ height: "2px", width: "100%" }}
                />
                <Panel order={2}>
                  <Typography variant="h6" sx={{ p: 1 }}>
                    Output Schema
                  </Typography>
                  <CompositeTableSchema />
                </Panel>
              </PanelGroup>
            </Panel>
            <StyledPanelResizeHandle sx={{ width: "2px", height: "100%" }} />
            <Panel order={2}>
              <PanelGroup autoSaveId="MainContentPane" direction="vertical">
                <Panel
                  collapsible={true}
                  minSize={10}
                  defaultSize={75}
                  maxSize={100}
                  order={1}
                >
                  <MainContent />
                </Panel>
                <StyledPanelResizeHandle
                  sx={{ height: "2px", width: "100%" }}
                />
                <Panel order={2} defaultSize={25} minSize={10} maxSize={50}>
                  <BottomPane />
                </Panel>
              </PanelGroup>
            </Panel>
            <StyledPanelResizeHandle sx={{ width: "2px", height: "100%" }} />
            <Panel order={3}>
              <RightSidebar />
            </Panel>
          </PanelGroup>
        )}
      </Box>

      <ModalDialog />
      <AppDrawer open={false} onClose={() => {}} />
    </Box>
  );
}
