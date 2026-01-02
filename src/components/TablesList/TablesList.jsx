/**
 * @fileoverview TablesList Component
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
 * @module components/TablesList/TablesList
 *
 * @example
 * <EnhancedTablesList />
 */

/* eslint-disable react/prop-types */
/**
 * SourceTables.jsx
 *
 * A component for displaying and interacting with the set of source tables.
 */

import { useCallback, useState } from "react";

import DragDropFileUpload from "./DragDropFileUpload";
import withAllTablesData from "./withAllTablesData";
import { registerFiles } from "../../lib/duckdb";
import {
  TableHead,
  TableRow,
  Table,
  TableCell,
  Button,
  TableBody,
  TableContainer,
  Typography, 
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
import {
  EnhancedTableDragContainer,
  EnhancedTableRowSummary,
} from "../TableView";
import { DRAG_TYPE_SOURCE_TABLE_ROW } from "../CustomDragLayer";
import { EnhancedTablesToolbar } from "./TablesToolbar";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import withFocusedObjectData from "../HOC/withFocusedObjectData";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";

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

function TablesList({
  tables,
  selectedTableIds,
  setSelectedTableIds,
  rowMax,
  columnMax,
  bytesMax,
  createTables, // callback for creating tables from uploaded files
  deleteTables, // callback for deleting tables from Roundup
  addNewOperation, // callback for adding a new operation
  insertTablesInFocusedOperation, // callback for inserting tables into an existing operation

  // Props defined in withAssociatedAlerts (for focused objectId)
  totalCount: focusedObjectHasAlerts,
}) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TablesList");
  }
  const [searchString, setSearchString] = useState("");
  const [sortAttribute, setSortAttribute] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  const clearSelectedTableIds = useCallback(() => {
    setSelectedTableIds([]);
  }, [setSelectedTableIds]);

  const sortedTables = tables.toSorted((a, b) =>
    isAscending
      ? ascending(a[sortAttribute], b[sortAttribute])
      : descending(a[sortAttribute], b[sortAttribute])
  );

  async function handleFileUpload(files) {
    if (!files.length) return;
    registerFiles(files)
      .then(() =>
        createTables(
          files.map((f) => ({
            source: "file upload",
            name: f.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9_]/g, "_"),
            fileName: f.name,
            extension: f.name.split(".").pop().toLowerCase(),
            size: f.size,
            mimeType: f.type,
            dateLastModified: f.lastModified,
          }))
        )
      )
      .catch((error) => {
        alert("Error uploading files: " + error.message);
      });
  }

  const handleSelectAllClick = useCallback(() => {
    if (selectedTableIds.length > 0) {
      clearSelectedTableIds();
    } else {
      setSelectedTableIds(tables.map(({ id }) => id));
    }
  }, [
    selectedTableIds.length,
    setSelectedTableIds,
    tables,
    clearSelectedTableIds,
  ]);

  const handleDeleteClick = useCallback(() => {
    deleteTables(selectedTableIds);
    clearSelectedTableIds();
  }, [deleteTables, selectedTableIds, clearSelectedTableIds]);

  const handleAddPackOperationClick = useCallback(() => {
    addNewOperation(OPERATION_TYPE_PACK, selectedTableIds);
    clearSelectedTableIds();
  }, [addNewOperation, selectedTableIds, clearSelectedTableIds]);

  const handleAddStackOperationClick = useCallback(() => {
    addNewOperation(OPERATION_TYPE_STACK, selectedTableIds);
    clearSelectedTableIds();
  }, [addNewOperation, selectedTableIds, clearSelectedTableIds]);

  const handleInsertTablesInOperationClick = useCallback(() => {
    insertTablesInFocusedOperation(selectedTableIds);
    clearSelectedTableIds();
  }, [insertTablesInFocusedOperation, selectedTableIds, clearSelectedTableIds]);

  if (tables.length === 0) {
    return (
      <DragDropFileUpload
        handleFileUpload={handleFileUpload}
        acceptedTypes="*"
      />
    );
  }

  return (
    <>
      <EnhancedTablesToolbar
        searchString={searchString}
        setSearchString={setSearchString}
        onFileUpload={handleFileUpload}
        selectedTableIds={selectedTableIds}
        setSelectedTableIds={setSelectedTableIds}
        focusedObjectHasAlerts={focusedObjectHasAlerts}
        handleSelectAllClick={handleSelectAllClick}
        handleDeleteClick={handleDeleteClick}
        handleAddPackOperationClick={handleAddPackOperationClick}
        handleAddStackOperationClick={handleAddStackOperationClick}
        handleInsertTablesInOperationClick={handleInsertTablesInOperationClick}
      />
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
                    <Typography variant="subsection-title">
                    {header.label}
                    </Typography>
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
                onDragEnd={(item, dropResult) =>
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
                  onTrClick={(event) => {
                    const currentIndex = sortedTables
                      .map(({ id }) => id)
                      .indexOf(id);
                    const isCurrentlySelected = selectedTableIds.includes(id);

                    // Ctrl/Cmd + click: Toggle individual selection
                    if (event.ctrlKey || event.metaKey) {
                      if (isCurrentlySelected) {
                        setSelectedTableIds(
                          selectedTableIds.filter((tableId) => tableId !== id)
                        );
                      } else {
                        setSelectedTableIds([...selectedTableIds, id]);
                      }
                      setLastClickedIndex(currentIndex);
                    }
                    // Shift + click: Select range
                    else if (event.shiftKey && lastClickedIndex !== null) {
                      const start = Math.min(lastClickedIndex, currentIndex);
                      const end = Math.max(lastClickedIndex, currentIndex);
                      const rangeIds = sortedTables
                        .map(({ id }) => id)
                        .slice(start, end + 1);

                      // Combine existing selection with range
                      const newSelection = [
                        ...new Set([...selectedTableIds, ...rangeIds]),
                      ];
                      setSelectedTableIds(newSelection);
                    }
                    // Simple click: Toggle single item
                    else {
                      if (isCurrentlySelected) {
                        setSelectedTableIds(
                          selectedTableIds.filter((tableId) => tableId !== id)
                        );
                      } else {
                        setSelectedTableIds([...selectedTableIds, id]);
                      }
                      setLastClickedIndex(currentIndex);
                    }
                  }}
                  isSelected={selectedTableIds.includes(id)}
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
const TablesListWithFocusedAlerts = (props) => {
  const { focusedObjectId, ...rest } = props;
  return <TablesList {...rest} id={focusedObjectId} />;
};

const EnhancedTablesList = withAllTablesData(
  withAssociatedAlerts(withFocusedObjectData(TablesListWithFocusedAlerts))
);

EnhancedTablesList.displayName = "Enhanced Tables List";

export default EnhancedTablesList;

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
