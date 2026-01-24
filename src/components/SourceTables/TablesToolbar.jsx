/**
 * @fileoverview TablesToolbar Component
 *
 * Toolbar component for the tables list providing table management actions and
 * operation creation buttons. Enables bulk operations on selected tables and
 * integration with the schema composition system.
 *
 * Features:
 * - Search functionality
 * - Upload button
 * - Select all/none toggle
 * - Delete selected tables
 * - Create PACK/STACK operations from selected tables
 * - Insert tables into focused operation
 *
 * @module components/SourceTables/TablesToolbar
 *
 * @example
 * <EnhancedTablesToolbar
 *   setSearchString={setSearch}
 *   onFileUpload={handleUpload}
 *   selectedTableIds={selected}
 *   handleSelectAllClick={handleSelectAll}
 *   handleDeleteClick={handleDelete}
 *   handleAddPackOperationClick={handleAddPack}
 *   handleAddStackOperationClick={handleAddStack}
 *   handleInsertTablesInOperationClick={handleInsert}
 *   focusedObjectHasAlerts={false}
 * />
 */

import { Divider, Toolbar } from "@mui/material";
import SearchTextBox from "../ui/input/SearchTextBox";
import withGlobalInterfaceData from "../HOC/withGlobalInterfaceData";

/**
 * TablesToolbar Component
 *
 * Provides table management and operation creation controls.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.focusedObjectId - Currently focused object ID
 * @param {Function} props.insertTablesInFocusedOperation - Insert tables callback
 * @param {Function} props.setSearchString - Update search filter
 * @param {Function} props.onFileUpload - File upload handler
 * @param {string[]} [props.selectedTableIds=[]] - Selected table IDs
 * @param {Function} props.handleSelectAllClick - Select all/none toggle
 * @param {Function} props.handleDeleteClick - Delete selected tables
 * @param {Function} props.handleAddPackOperationClick - Create PACK operation
 * @param {Function} props.handleAddStackOperationClick - Create STACK operation
 * @param {Function} props.handleInsertTablesInOperationClick - Insert into operation
 * @param {boolean} props.focusedObjectHasAlerts - Whether focused object has errors
 *
 * @returns {React.ReactElement} A toolbar with table management buttons
 */
const TablesToolbar = ({
  // Props defined in withGlobalInterfaceData HOC
  focusedObjectId,
  insertTablesInFocusedOperation,
  // Props defined directly in parent component
  setSearchString,
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
        {/* <SelectToggleIconButton
          onClick={handleSelectAllClick}
          isSelected={selectedTableIds.length > 0}
        /> */}
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        {/* <InsertTableInOperationButton
          disabled={disableNextOperation}
          onClick={handleInsertTablesInOperationClick}
        /> */}
        {/* <AddPackOperationButton
          disabled={disableNextOperation}
          onClick={handleAddPackOperationClick}
        /> */}
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
