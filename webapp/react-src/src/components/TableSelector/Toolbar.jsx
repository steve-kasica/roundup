import {
  Divider,
  Grid2 as Grid,
  InputAdornment,
  Paper,
  styled,
  TextField,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Upload as UploadIcon,
  ViewList as ViewListIcon,
  TableRows as TableRowsIcon,
  SelectAll as SelectAllIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from "@mui/material/ToggleButtonGroup";

import { LAYOUT_ID as tableLayout } from "./TableLayout";
import { LAYOUT_ID as listLayout } from "./ListLayout";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
    {
      marginLeft: -1,
      borderLeft: "1px solid transparent",
    },
}));

export default function Toolbar({
  searchString,
  selectedTables,
  layout,
  onFileUpload = () => console.log("File upload clicked"),
  onClearSelection = () => console.log("Clear selection clicked"),
  onSelectAll = () => console.log("Select all tables clicked"),
  onLayoutChange = () => console.log("Layout changed"),
  onDeleteAll = () => console.log("Delete all tables clicked"),
  onSearchChange = () => console.log("Search string changed"),
}) {
  return (
    <Grid
      container
      spacing={1}
      sx={{ marginBottom: "10px", alignItems: "center" }}
    >
      <Grid size="auto" sx={{ flexGrow: 1 }}>
        <TextField
          placeholder="Search tables..."
          size="small"
          fullWidth
          value={searchString}
          onChange={onSearchChange}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f5f5f5",
              border: "1px solid #d0d0d0",
              "&:hover": {
                backgroundColor: "#f0f0f0",
                border: "1px solid #c0c0c0",
              },
              "&.Mui-focused": {
                backgroundColor: "#ffffff",
                border: "1px solid #1976d2",
              },
              "& fieldset": {
                border: "none",
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size="auto">
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            // border: `1px solid ${theme.palette.divider}`,
            flexWrap: "wrap",
          }}
        >
          <StyledToggleButtonGroup size="small">
            <ToggleButton onClick={onSelectAll} aria-label="select all">
              <Tooltip title="Select all">
                <SelectAllIcon />
              </Tooltip>
            </ToggleButton>

            <ToggleButton
              disabled={selectedTables.length === 0}
              onClick={onDeleteAll}
              aria-label="delete all"
            >
              <Tooltip title="Delete all">
                <DeleteIcon />
              </Tooltip>
            </ToggleButton>

            <Tooltip title="Clear selection">
              <span>
                {/* span allows tooltip to work when button is disabled */}
                <ToggleButton
                  onClick={onClearSelection}
                  disabled={selectedTables.length === 0}
                  aria-label="clear selection"
                >
                  <ClearIcon />
                </ToggleButton>
              </span>
            </Tooltip>

            <ToggleButton
              onClick={() =>
                document.getElementById("file-upload-input")?.click()
              }
              aria-label="file upload"
            >
              <Tooltip title="Upload more files">
                <UploadIcon />
              </Tooltip>
            </ToggleButton>
            {/* Hidden file input */}
            <input
              type="file"
              multiple
              onChange={(event) => {
                onFileUpload(event);
                // Reset input value to allow selecting the same file again
                event.target.value = "";
              }}
              style={{ display: "none" }}
              id="file-upload-input"
              accept=".csv,.json,.txt,.xls,.xlsx,.tsv"
            />
          </StyledToggleButtonGroup>
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
          <StyledToggleButtonGroup
            value={layout}
            exclusive
            onChange={onLayoutChange}
            size="small"
            aria-label="change layout"
          >
            <ToggleButton value={tableLayout} aria-label="table view">
              <Tooltip title="Table view">
                <TableRowsIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value={listLayout} aria-label="list view">
              <Tooltip title="List view">
                <ViewListIcon />
              </Tooltip>
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Paper>
      </Grid>
    </Grid>
  );
}

Toolbar.propTypes = {
  searchString: PropTypes.string.isRequired,
  selectedTables: PropTypes.array.isRequired,
  layout: PropTypes.string.isRequired,
  onFileUpload: PropTypes.func,
  onClearSelection: PropTypes.func,
  onSelectAll: PropTypes.func,
  onLayoutChange: PropTypes.func,
  onDeleteAll: PropTypes.func,
  onSearchChange: PropTypes.func,
};
