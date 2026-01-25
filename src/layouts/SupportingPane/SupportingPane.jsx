/**
 * @fileoverview Main supporting pane layout component.
 * @module layouts/SupportingPane/SupportingPane
 *
 * Primary application layout with resizable panels containing the
 * sidebar, schema view, table view, and column detail windows.
 *
 * Features:
 * - Three-panel horizontal layout with resize handles
 * - Left sidebar with tables/operations lists
 * - Center area with schema and table views
 * - Right column detail window (conditionally shown)
 * - Styled resize handles with hover effects
 * - Persistent panel sizes
 *
 * @example
 * import SupportingPane from './SupportingPane';
 * <SupportingPane />
 */
import { name as APP_NAME } from "../../../package.json";
import { Typography, Box, styled, IconButton } from "@mui/material";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import LeftSideBar from "./LeftSideBar";
import { useSelector } from "react-redux";
import { selectAllTablesData } from "../../slices/tablesSlice";
import CompositeTableSchema from "../../components/CompositeTableSchema";
import ColumnWindow from "./ColumnWindow";
import TableWindow from "./TableWindow";
import SchemaWindow from "./SchemaWindow";
import {
  selectOperationsById,
  selectRootOperationId,
} from "../../slices/operationsSlice";
import {
  selectFocusedColumnIds,
  selectFocusedObjectId,
} from "../../slices/uiSlice";
import FileUpload from "../../components/FileUpload";
import RoundupToolbar from "../../components/AppToolbar";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useRef, useState } from "react";
import { InfoIcon } from "../../components/ui/icons";
// Add this import for operations

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

const CompositeSchemaContainerSizes = {
  COLLAPSED: 4,
  EXPANDED: 30,
};

export default function SupportingPane() {
  const tables = useSelector(selectAllTablesData);
  const rootOperation = useSelector((state) => {
    const id = selectRootOperationId(state);
    return id ? selectOperationsById(state, id) : null;
  });
  const focusedObject = useSelector(selectFocusedObjectId);
  const focusedColumnIds = useSelector(selectFocusedColumnIds);
  const isOpen = tables.length > 0;
  const compositeSchemaRef = useRef(null);
  const [isCompositeSchemaCollapsed, setIsCompositeSchemaCollapsed] =
    useState(false);

  const handleCollapseCompositeSchema = () => {
    if (compositeSchemaRef.current) {
      if (isCompositeSchemaCollapsed) {
        compositeSchemaRef.current.resize(
          CompositeSchemaContainerSizes.EXPANDED,
        );
      } else {
        compositeSchemaRef.current.resize(
          CompositeSchemaContainerSizes.COLLAPSED,
        );
      }
      setIsCompositeSchemaCollapsed(!isCompositeSchemaCollapsed);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          borderBottom: "2px solid",
          borderColor: "#ccc",
        }}
      >
        <RoundupToolbar />
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {/* If there are no uploaded tables, show the fileUpload component */}
        {!isOpen ? (
          <FileUpload />
        ) : (
          <PanelGroup autoSaveId="SupportingPane" direction="horizontal">
            <Panel
              id="left-sidebar-panel"
              collapsible={true}
              minSize={10}
              defaultSize={25}
              maxSize={100}
              order={1}
            >
              <PanelGroup autoSaveId="LeftSidebarPane" direction="vertical">
                <Panel
                  id="left-sidebar-main"
                  collapsible={true}
                  minSize={10}
                  defaultSize={rootOperation ? 70 : 100}
                  maxSize={100}
                  order={1}
                  style={{ padding: "5px" }}
                >
                  <LeftSideBar />
                </Panel>
                {rootOperation && (
                  <>
                    <StyledPanelResizeHandle
                      sx={{ height: "2px", width: "100%" }}
                    />
                    <Panel
                      id="composite-table-schema-panel"
                      ref={compositeSchemaRef}
                      minSize={CompositeSchemaContainerSizes.COLLAPSED}
                      defaultSize={CompositeSchemaContainerSizes.EXPANDED}
                      collapsible={false}
                      order={2}
                      style={{ padding: "5px" }}
                    >
                      <Box display="flex" flexDirection="column" height="100%">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent={"space-between"}
                          mb={0}
                        >
                          <Typography variant="h6" gutterBottom>
                            Composite Schema
                            <InfoIcon
                              sx={{ ml: 1 }}
                              tooltipText={
                                "The Composite Schema provides the highest level"
                              }
                            />
                          </Typography>
                          <IconButton onClick={handleCollapseCompositeSchema}>
                            <KeyboardArrowDown
                              sx={{
                                transform: isCompositeSchemaCollapsed
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                                transition: "transform 0.3s",
                              }}
                            />
                          </IconButton>
                        </Box>
                        <CompositeTableSchema />
                      </Box>
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>
            <StyledPanelResizeHandle sx={{ width: "2px", height: "100%" }} />
            <Panel id="main-content-panel" order={2}>
              <PanelGroup autoSaveId="MainContentPane" direction="vertical">
                <Panel
                  id="schema-window-panel"
                  collapsible={true}
                  defaultSize={25}
                  maxSize={100}
                  order={1}
                >
                  <SchemaWindow />
                </Panel>
                {focusedObject && (
                  <>
                    <StyledPanelResizeHandle
                      sx={{ height: "2px", width: "100%" }}
                    />
                    <Panel
                      id="table-window-panel"
                      order={2}
                      collapsible={true}
                      defaultSize={75}
                      style={{
                        display: "flex",
                        padding: "5px",
                        overflow: "auto",
                      }}
                    >
                      <TableWindow id={focusedObject} />
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>
            {focusedColumnIds && focusedColumnIds.length > 0 && (
              <>
                <StyledPanelResizeHandle
                  sx={{ width: "2px", height: "100%" }}
                />
                <Panel
                  id="column-window-panel"
                  order={3}
                  collapsible={true}
                  collapsed={!(focusedColumnIds && focusedColumnIds.length > 0)}
                  maxSize={50}
                  defaultSize={25}
                  style={{ padding: "5px" }}
                >
                  <ColumnWindow columnIds={focusedColumnIds} />
                </Panel>
              </>
            )}
          </PanelGroup>
        )}
      </Box>
    </Box>
  );
}
