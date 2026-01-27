import { Toolbar, Box, Divider } from "@mui/material";
import FocusedObjectSelect from "./FocusedObjectSelect";
import RenameFocusedObjectButton from "./RenameFocusedObjectButton";
import ChangeTableOrder from "./ChangeTableOrder";
import AlertsButton from "./AlertsButton";
import FocusColumnsButton from "./FocusColumnsButton";
import DeleteColumnsButton from "./DeleteColumnsButton";
import { ExportTableButton } from "./ExportTable";
import SelectAllColumnsButton from "./SelectAllColumnsButton";
import HideColumnsButton from "./HideColumnsButton";

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
        <ExportTableButton />
        <Divider orientation="vertical" flexItem />
        <Divider orientation="vertical" flexItem />
      </Box>
      <AlertsButton />
    </Toolbar>
  );
};

export default AppToolbar;
