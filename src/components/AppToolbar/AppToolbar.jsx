import { Toolbar, Box, Divider, Typography } from "@mui/material";
import FocusedObjectSelect from "./FocusedObjectSelect";
import RenameFocusedObjectButton from "./RenameFocusedObjectButton";
import ChangeTableOrder from "./ChangeTableOrder";
import SchemaAlertsButton from "./SchemaAlertsButton";
import FocusColumnsButton from "./FocusColumnsButton";
import DeleteColumnsButton from "./DeleteColumnsButton";
import { ExportTableButton } from "./ExportTable";
import UploadTablesButton from "./UploadTablesButton";
import SelectAllColumnsButton from "./SelectAllColumnsButton";
import HideColumnsButton from "./HideColumnsButton";
import JoinPredicateButton from "./JoinPredicateButton";
import JoinKeysButton from "./JoinKeysButton";
import { EnhancedPackMatchToggleButtonGroup } from "./PackMatchToggleButtonGroup";

const AppToolbar = () => {
  return (
    <Toolbar
      variant="dense"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        minHeight: 48,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
        <FocusedObjectSelect />
        <RenameFocusedObjectButton />
        <ChangeTableOrder />
        <Divider orientation="vertical" flexItem />
        <Box display={"flex"} flexDirection={"column"}>
          <Box>
            <SelectAllColumnsButton />
            <FocusColumnsButton />
            <HideColumnsButton />
            <DeleteColumnsButton />
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem />
        <UploadTablesButton />
        <ExportTableButton />
        <Divider orientation="vertical" flexItem />
        <EnhancedPackMatchToggleButtonGroup />
        <JoinPredicateButton />
        {/* <JoinKeysButton /> */}
        <Divider orientation="vertical" flexItem />
      </Box>
      <SchemaAlertsButton />
    </Toolbar>
  );
};

export default AppToolbar;
