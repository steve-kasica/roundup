import {
  Divider,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  styled,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

import { LAYOUT_ID as tableLayout } from "./TableLayout";

export default function Toolbar({
  searchString,
  selectedTables,
  layout,
  onFileUpload,
  onClearSelection,
  onSelectAll,
  onLayoutChange,
  onDeleteAll,
  onSearchChange,
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // menu items written in JSX below (so dividers can be added manually)
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
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleMenuOpen}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? "true" : undefined}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem
          disabled={!searchString}
          onClick={() => {
            onSearchChange({ target: { value: "" } });
          }}
        >
          Clear search
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onSelectAll();
            handleMenuClose();
          }}
        >
          Select all
        </MenuItem>
        <MenuItem
          disabled={selectedTables.length === 0}
          onClick={() => {
            onDeleteAll();
            handleMenuClose();
          }}
        >
          Delete all
        </MenuItem>
        <MenuItem
          disabled={selectedTables.length === 0}
          onClick={() => {
            onClearSelection();
            handleMenuClose();
          }}
        >
          Clear selection
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            document.getElementById("file-upload-input")?.click();
            handleMenuClose();
          }}
        >
          Upload more files
        </MenuItem>
      </Menu>

      {/* hidden file input used by the Upload menu item */}
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
    </Grid>
  );
}

Toolbar.propTypes = {
  searchString: PropTypes.string.isRequired,
  selectedTables: PropTypes.array.isRequired,
  layout: PropTypes.string.isRequired,
  onFileUpload: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onLayoutChange: PropTypes.func.isRequired,
  onDeleteAll: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};
