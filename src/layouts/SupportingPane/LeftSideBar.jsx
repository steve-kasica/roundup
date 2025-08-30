import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import PropTypes from "prop-types";
import TableSelector from "../../components/TableSelector";
import OperationsList from "../../components/OperationsList";
import CompositeTableSchema from "../../components/CompositeTableSchema";
// import CustomTabPanel from "./CustomTabPanel";

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
          <Tab label="Operations" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <CustomTabPanel value={value} index={0}>
          <TableSelector />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <OperationsList />
        </CustomTabPanel>
      </Box>
      <Box sx={{ mt: "auto", border: "1px solid #ddd", padding: 5 }}>
        <CompositeTableSchema />
      </Box>
    </Box>
  );
};

export default LeftSideBar;
