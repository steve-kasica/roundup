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
  const isSelectionEmpty = selectedTableIds.length === 0;

  // Halt user's progress in adding new operations if:
  //   - There are no selected tables OR
  //   - The focused object has alerts OR
  //   - The focused object is not an operation
  const disableNextOperation = isSelectionEmpty || focusedObjectHasAlerts;
  // (focusedObjectId !== null && !isOperationId(focusedObjectId))
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
          disabled={isSelectionEmpty}
          onConfirm={handleDeleteClick}
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <InsertTableInOperationButton
          disabled={disableNextOperation}
          onClick={handleInsertTablesInOperationClick}
        />
        <AddPackOperationButton
          disabled={disableNextOperation}
          onClick={handleAddPackOperationClick}
        />
        <AddStackOperationButton
          disabled={disableNextOperation}
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
