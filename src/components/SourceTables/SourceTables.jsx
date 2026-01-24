/**
 * @fileoverview SourceTables Component
 *
 * The main source tables management component, displaying all available tables in
 * a sortable, interactive list with drag-and-drop support for creating operations.
 *
 * Features:
 * - Sortable table list (by name, type, size, rows, columns, etc.)
 * - Drag-and-drop to create operations or add to schema
 * - File upload via drag-and-drop zone
 * - Table selection for bulk operations
 * - Search/filter functionality
 * - Integration with operation creation
 *
 * @module components/SourceTables/SourceTables
 *
 * @example
 * <EnhancedSourceTables />
 */

/* eslint-disable react/prop-types */
/**
 * SourceTables.jsx
 *
 * A component for displaying and interacting with the set of source tables.
 */

import { useCallback, useMemo, useState } from "react";

import withAllTablesData from "./withAllTablesData";
import {
  TableHead,
  TableRow,
  Table,
  TableCell,
  Button,
  TableBody,
  TableContainer,
  Typography,
  Box,
  LinearProgress,
  Toolbar,
} from "@mui/material";
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowUp10,
  ArrowUpDown,
  ArrowUpWideNarrow,
  ArrowUpZA,
} from "lucide-react";
import {
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_DATE,
} from "../../slices/columnsSlice";
import { ascending, descending } from "d3";

import { EnhancedTableDragContainer } from "./TableDragContainer";
import { EnhancedTableRowSummary } from "./TableRowSummary";
import { DRAG_TYPE_SOURCE_TABLE_ROW } from "../CustomDragLayer";
import { EnhancedTablesToolbar } from "./TablesToolbar";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import withFocusedObjectData from "../HOC/withFocusedObjectData";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";
import SearchTextBox from "../ui/input/SearchTextBox";
import { useDispatch, useSelector } from "react-redux";
import {
  addToSelectedTableIds,
  removeFromSelectedTableIds,
  selectSelectedTableIds,
  setSelectedTableIds,
} from "../../slices/uiSlice";
// import SearchTablesInput from "./SearchTablesInput/SearchTablesInput";
import {
  SearchTablesInput,
  UploadTablesButton,
  ActionsButton,
  DeleteTablesButton,
} from "./ToolbarItems";
import { deleteTablesRequest } from "../../sagas/deleteTablesSaga";

const headers = [
  {
    attr: "name",
    label: "Name",
    tooltip: "Sort by selected tables",
    attrType: COLUMN_TYPE_CATEGORICAL,
  },
  {
    attr: "mimeType",
    label: "Type",
    tooltip: "Sort by file type",
    attrType: COLUMN_TYPE_CATEGORICAL,
  },
  {
    attr: "size",
    label: "Size",
    tooltip: "Sort by file size",
    attrType: COLUMN_TYPE_NUMERICAL,
  },
  {
    attr: "rowCount",
    label: "Rows",
    tooltip: "Sort by total rows",
    attrType: COLUMN_TYPE_NUMERICAL,
  },
  {
    attr: "columnCount",
    label: "Columns",
    tooltip: "Sort by total columns",
    attrType: COLUMN_TYPE_NUMERICAL,
  },
  {
    attr: "dateLastModified",
    label: "Modified",
    tooltip: "Sort by date last modified",
    attrType: COLUMN_TYPE_DATE,
  },
];

function SourceTables({
  tables,
  rowMax,
  columnMax,
  bytesMax,
  deleteTables, // callback for deleting tables from Roundup
  addNewOperation, // callback for adding a new operation
  insertTablesInFocusedOperation, // callback for inserting tables into an existing operation

  // Props defined in withAssociatedAlerts (for focused objectId)
  totalCount: focusedObjectHasAlerts,
}) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering SourceTables");
  }
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState("");
  const [sortAttribute, setSortAttribute] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  const selectedTableIds = useSelector(selectSelectedTableIds);

  // Sort tables based on selected attribute and order
  const sortedTables = useMemo(
    () =>
      tables.toSorted((a, b) =>
        isAscending
          ? ascending(a[sortAttribute], b[sortAttribute])
          : descending(a[sortAttribute], b[sortAttribute]),
      ),
    [tables, sortAttribute, isAscending],
  );

  const handleOnDeleteTables = useCallback(() => {
    dispatch(deleteTablesRequest(selectedTableIds));
  }, [dispatch, selectedTableIds]);

  // Clear tables for component selection
  // const clearSelectedTableIds = useCallback(() => {
  //   setSelectedTableIds([]);
  // }, [setSelectedTableIds]);

  // Select all / Deselect all tables
  // const handleSelectAllClick = useCallback(() => {
  //   if (selectedTableIds.length > 0) {
  //     dispatch(clearSelectedTableIds());
  //   } else {
  //     dispatch(setSelectedTableIds(tables.map(({ id }) => id)));
  //   }
  // }, [selectedTableIds.length, dispatch, tables]);

  // Delete tables callback
  // const handleDeleteClick = useCallback(() => {
  //   deleteTables(selectedTableIds);
  //   clearSelectedTableIds();
  // }, [deleteTables, selectedTableIds, clearSelectedTableIds]);

  // Add Pack operation callback
  // const handleAddPackOperationClick = useCallback(() => {
  //   addNewOperation(OPERATION_TYPE_PACK, selectedTableIds);
  //   clearSelectedTableIds();
  // }, [addNewOperation, selectedTableIds, clearSelectedTableIds]);

  // Add Stack operation callback
  // const handleAddStackOperationClick = useCallback(() => {
  //   addNewOperation(OPERATION_TYPE_STACK, selectedTableIds);
  //   clearSelectedTableIds();
  // }, [addNewOperation, selectedTableIds, clearSelectedTableIds]);

  // Insert tables into focused operation callback
  // const handleInsertTablesInOperationClick = useCallback(() => {
  //   insertTablesInFocusedOperation(selectedTableIds);
  //   clearSelectedTableIds();
  // }, [insertTablesInFocusedOperation, selectedTableIds, clearSelectedTableIds]);

  const handleRowClick = useCallback(
    (event, id) => {
      const currentIndex = sortedTables.map(({ id }) => id).indexOf(id);
      const isCurrentlySelected = selectedTableIds.includes(id);
      // Ctrl/Cmd + click: Toggle individual selection
      if (event.ctrlKey || event.metaKey) {
        if (isCurrentlySelected) {
          dispatch(removeFromSelectedTableIds(id));
        } else {
          dispatch(addToSelectedTableIds(id));
        }
        setLastClickedIndex(currentIndex);
      }
      // Shift + click: Select range
      else if (event.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, currentIndex);
        const end = Math.max(lastClickedIndex, currentIndex);
        const rangeIds = sortedTables.map(({ id }) => id).slice(start, end + 1);
        dispatch(
          addToSelectedTableIds(
            rangeIds.filter((tableId) => !selectedTableIds.includes(tableId)),
          ),
        );
      }
      // Simple click: Toggle single item
      else {
        if (isCurrentlySelected) {
          dispatch(removeFromSelectedTableIds(id));
        } else {
          dispatch(addToSelectedTableIds(id));
        }
        setLastClickedIndex(currentIndex);
      }
    },
    [dispatch, lastClickedIndex, selectedTableIds, sortedTables],
  );

  return (
    <>
      <Toolbar disableGutters>
        <SearchTablesInput />
        <UploadTablesButton />
        <DeleteTablesButton onConfirm={handleOnDeleteTables} />
        <ActionsButton />
      </Toolbar>
      <TableContainer
        sx={{
          width: "100%",
          containerType: "inline-size",
          containerName: "tableLayout",
        }}
      >
        <Table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            <TableRow
              style={{
                borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
              }}
            >
              <TableCell></TableCell>
              {headers.map((header) => (
                <TableCell
                  key={header.attr}
                  data-column={header.attr}
                  sx={{
                    padding: 0,
                    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Button
                    color="inherit"
                    fullWidth
                    onClick={() => {
                      if (header.attr === sortAttribute) {
                        setIsAscending(!isAscending);
                      } else {
                        setSortAttribute(header.attr);
                      }
                    }}
                  >
                    <Typography variant="label">{header.label}</Typography>
                    &nbsp;
                    <SortIcon
                      attr={header.attr}
                      isSort={header.attr === sortAttribute}
                      attrType={header.attrType}
                      isAscending={isAscending}
                    />
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTables.map(({ id, name }) => (
              <EnhancedTableDragContainer
                key={id}
                id={id}
                canDrag={true}
                dragType={DRAG_TYPE_SOURCE_TABLE_ROW}
                tableIds={selectedTableIds}
                onDragEnd={(_item, dropResult) =>
                  dropResult ? setSelectedTableIds([]) : null
                }
              >
                <EnhancedTableRowSummary
                  id={id}
                  searchString={searchString}
                  hasNameMatch={name.toLowerCase().includes(searchString)}
                  rowMax={rowMax}
                  columnMax={columnMax}
                  bytesMax={bytesMax}
                  onTrClick={handleRowClick}
                />
              </EnhancedTableDragContainer>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

// Wrapper component to map focusedObjectId to id for withAssociatedAlerts
const SourceTablesWithFocusedAlerts = (props) => {
  const { focusedObjectId, ...rest } = props;
  return <SourceTables {...rest} id={focusedObjectId} />;
};

const EnhancedSourceTables = withAllTablesData(
  withAssociatedAlerts(withFocusedObjectData(SourceTablesWithFocusedAlerts)),
);

EnhancedSourceTables.displayName = "Enhanced Tables List";

export default EnhancedSourceTables;

// eslint-disable-next-line no-unused-vars
function SortIcon({ attr, isSort, attrType, isAscending }) {
  const iconProps = { strokeWidth: 1, size: 18 };

  let AscIcon, DescIcon;
  if (attrType === COLUMN_TYPE_CATEGORICAL) {
    [AscIcon, DescIcon] = [ArrowDownAZ, ArrowUpZA];
  } else if (attrType === COLUMN_TYPE_NUMERICAL) {
    [AscIcon, DescIcon] = [ArrowDown01, ArrowUp10];
  } else {
    [AscIcon, DescIcon] = [ArrowDownNarrowWide, ArrowUpWideNarrow];
  }

  return isSort ? (
    isAscending ? (
      <AscIcon {...iconProps} />
    ) : (
      <DescIcon {...iconProps} />
    )
  ) : (
    <ArrowUpDown {...iconProps} />
  );
}

/**
 * const menuItems = [
    {
      label: "Rename table",
      isDisabled: false,
      onClick: (event) => {
        const newName = prompt("Enter new table name:", name);
        if (newName && newName.trim() !== "") {
          setTableName(newName);
        }
        handleMenuClose(event);
      },
    },
    {
      label: "Add to selection",
      isDisabled: isSelected || isDisabled || isInSchema,
      onClick: (event) => {
        console.log("Adding to selection (TODO)");
        handleMenuClose(event);
      },
    },
    {
      label: `Remove from schema`,
      isDisabled: !isInSchema,
      onClick: (event) => {
        // TODO
        handleMenuClose(event);
      },
    },
    {
      label: "Delete table",
      isDisabled: false,
      onClick: (event) => {
        dropTable();
        handleMenuClose(event);
      },
    },
  ];
 */
