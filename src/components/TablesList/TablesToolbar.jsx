import { Divider, Toolbar } from "@mui/material";
import SearchTextBox from "../ui/SearchTextBox";
import {
  DeleteColumnsButton,
  AddStackOperationButton,
  AddPackOperationButton,
  SelectToggleIconButton,
  UploadTablesButton,
  InsertTableInOperationButton,
} from "../ui/buttons";
import withGlobalInterfaceData from "../HOC/withGlobalInterfaceData";
import { isOperationId } from "../../slices/operationsSlice";

const TablesToolbar = ({
  // Props defined in withGlobalInterfaceData HOC
  focusedObjectId,
  insertTablesInFocusedOperation,
  // Props defined directly in parent component
  setSearchString,
  onFileUpload,
  selectedTableIds = [],
  handleSelectAllClick,
  handleDeleteClick,
  handleAddPackOperationClick,
  handleAddStackOperationClick,
  handleInsertTablesInOperationClick,
  focusedObjectHasAlerts,
}) => {
  // menu items written in JSX below (so dividers can be added manually)
  return (
    <>
      <Toolbar disableGutters>
        <SearchTextBox
          placeholder="Search tables..."
          // searchString={searchString}
          onChange={setSearchString}
        />
        <UploadTablesButton onFileUpload={onFileUpload} />
        <SelectToggleIconButton
          onClick={handleSelectAllClick}
          isSelected={selectedTableIds.length > 0}
        />
        <DeleteColumnsButton
          title={`Delete selected table${
            selectedTableIds.length !== 1 ? "s" : ""
          }`}
          disabled={selectedTableIds.length === 0}
          onConfirm={handleDeleteClick}
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <InsertTableInOperationButton
          disabled={
            selectedTableIds.length === 0 ||
            !focusedObjectId ||
            !isOperationId(focusedObjectId)
          }
          onClick={handleInsertTablesInOperationClick}
        />
        <AddPackOperationButton
          disabled={
            selectedTableIds.length === 0 ||
            focusedObjectHasAlerts ||
            (focusedObjectId !== null && !isOperationId(focusedObjectId))
          }
          onClick={handleAddPackOperationClick}
        />
        <AddStackOperationButton
          disabled={
            selectedTableIds.length === 0 ||
            focusedObjectHasAlerts ||
            (focusedObjectId !== null && !isOperationId(focusedObjectId))
          }
          onClick={handleAddStackOperationClick}
        />
      </Toolbar>
      {/* hidden file input used by the Upload menu item */}
    </>
  );
};

TablesToolbar.displayName = "Tables List Toolbar";

const EnhancedTablesToolbar = withGlobalInterfaceData(TablesToolbar);

export { TablesToolbar, EnhancedTablesToolbar };

/**
 * 
 *     // <Grid
    //   container
    //   spacing={1}
    //   sx={{ marginBottom: "10px", alignItems: "center" }}
    // >
    //   <Grid size="auto" sx={{ flexGrow: 1 }}>

    //   </Grid>
      {/* <Menu
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
      </Menu> *
      
 */
