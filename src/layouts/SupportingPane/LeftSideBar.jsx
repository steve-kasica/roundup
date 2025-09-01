import React from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { Panel, PanelGroup } from "react-resizable-panels";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import TableSelector from "../../components/TableSelector";
import OperationsList from "../../components/OperationsList";
import CompositeTableSchema from "../../components/CompositeTableSchema";
import { selectAllOperationIds } from "../../slices/operationsSlice";
import StyledPanelResizeHandle from "./PanelResizeHandle";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const LeftSideBar = () => {
  const [value, setValue] = React.useState(0);

  // condition to disable the Operations tab
  const operations = useSelector(selectAllOperationIds);
  const disableOperations = operations.length === 0; // example condition

  // prevent switching to a disabled tab
  const handleChange = (event, newValue) => {
    // block switching to Operations tab when disabled
    if (newValue === 1 && disableOperations) return;
    setValue(newValue);
  };

  // if the tab becomes disabled while selected, fallback to the first tab
  React.useEffect(() => {
    if (disableOperations && value === 1) {
      setValue(0);
    }
  }, [disableOperations, value]);

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Source Tables" {...a11yProps(0)} />
          <Tab
            label="Operations"
            {...a11yProps(1)}
            disabled={disableOperations}
          />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <PanelGroup direction="vertical" autoSaveId={"LeftSideBar"}>
          <Panel order={1} minSize={20} defaultSize={70} maxSize={90}>
            <Box sx={{ overflow: "auto", height: "100%" }}>
              <CustomTabPanel value={value} index={0}>
                <TableSelector />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <OperationsList />
              </CustomTabPanel>
            </Box>
          </Panel>
          <StyledPanelResizeHandle
            sx={{
              height: "2px",
              width: "100%",
              cursor: "row-resize",
              display: "block",
              background: "#dedede",
              transition: "background 0.12s ease",
            }}
          ></StyledPanelResizeHandle>
          <Panel order={2} minSize={10} defaultSize={30} maxSize={80}>
            <Typography variant="h6" gutterBottom sx={{ padding: 1 }}>
              Output Table Schema
            </Typography>
            <CompositeTableSchema />
          </Panel>
        </PanelGroup>
      </Box>
    </Box>
  );
};

export default LeftSideBar;
