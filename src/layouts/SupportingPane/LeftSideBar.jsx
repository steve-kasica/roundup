/**
 * @fileoverview Left sidebar with tabbed navigation.
 * @module layouts/SupportingPane/LeftSideBar
 *
 * Tabbed sidebar component containing SourceTables and OperationsList
 * with conditional tab disabling based on data availability.
 *
 * Features:
 * - Tabbed interface for Tables and Operations
 * - Disables Operations tab when no operations exist
 * - Shows table/operation counts as chips
 * - Scrollable content within tabs
 * - Custom tab panel implementation
 *
 * @example
 * <LeftSideBar />
 */
import React from "react";
import { Box, Tabs, Tab, Chip } from "@mui/material";
import { useSelector } from "react-redux";
import SourceTables from "../../components/SourceTables";
import OperationsList from "../../components/OperationsList";
import { selectAllOperationIds } from "../../slices/operationsSlice";
import { selectAllTablesData } from "../../slices/tablesSlice";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ height: "100%" }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: 3,
            height: "100%", // TODO: Adjust height based on content
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            padding: 0,
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

const LeftSideBar = () => {
  const [value, setValue] = React.useState(0);

  // condition to disable the Operations tab
  const operations = useSelector(selectAllOperationIds);
  const disableOperations = operations.length === 0; // example condition

  const tables = useSelector(selectAllTablesData);

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
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Source Tables
                <Chip
                  label={tables.length}
                  disabled={tables.length === 0}
                  size="small"
                />
              </Box>
            }
            {...a11yProps(0)}
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Operations
                <Chip
                  label={operations.length}
                  disabled={operations.length === 0}
                  size="small"
                />
              </Box>
            }
            {...a11yProps(1)}
            disabled={operations.length === 0}
          />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ height: "100%" }}>
          <CustomTabPanel value={value} index={0}>
            <SourceTables />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <OperationsList />
          </CustomTabPanel>
        </Box>
      </Box>
    </Box>
  );
};

export default LeftSideBar;
