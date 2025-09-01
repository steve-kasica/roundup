import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import TableSelector from "../../components/TableSelector";
import OperationsList from "../../components/OperationsList";
import { selectAllOperationIds } from "../../slices/operationsSlice";

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
            height: "90%", // TODO: Adjust height based on content
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
        </Box>
      )}
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
        <Box sx={{ overflow: "auto", height: "100%" }}>
          <CustomTabPanel value={value} index={0}>
            <TableSelector />
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
