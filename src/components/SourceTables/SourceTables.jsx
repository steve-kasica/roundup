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

import { EnhancedTableRowSummary } from "./TableRowSummary";
import withFocusedObjectData from "../HOC/withFocusedObjectData";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";
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

function SourceTables({ tables, rowMax, columnMax, bytesMax }) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering SourceTables");
  }
  const dispatch = useDispatch();
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

  const handleRowClick = useCallback(
    (event, id) => {
      const currentIndex = sortedTables.map(({ id }) => id).indexOf(id);
      const isCurrentlySelected = selectedTableIds.includes(id);

      // Cmd/Ctrl + click: Toggle individual selection, preserve others
      if (event.ctrlKey || event.metaKey) {
        if (isCurrentlySelected) {
          dispatch(removeFromSelectedTableIds(id));
        } else {
          dispatch(addToSelectedTableIds(id));
        }
        setLastClickedIndex(currentIndex);
      }
      // Shift + click: Select contiguous range from anchor to current
      else if (event.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, currentIndex);
        const end = Math.max(lastClickedIndex, currentIndex);
        const rangeIds = sortedTables.map(({ id }) => id).slice(start, end + 1);
        dispatch(setSelectedTableIds(rangeIds));
        // Keep anchor at the original position for subsequent shift-clicks
      }
      // Simple click: Clear selection if already selected, otherwise select only this item
      else {
        if (isCurrentlySelected) {
          dispatch(setSelectedTableIds([]));
          setLastClickedIndex(null);
        } else {
          dispatch(setSelectedTableIds([id]));
          setLastClickedIndex(currentIndex);
        }
      }
    },
    [dispatch, lastClickedIndex, selectedTableIds, sortedTables],
  );

  return (
    <>
      <Box display="flex" alignItems="center" gap={1} padding={1}>
        <SearchTablesInput />
        <UploadTablesButton />
        <DeleteTablesButton onConfirm={handleOnDeleteTables} />
        <ActionsButton />
      </Box>
      <TableContainer
        sx={{
          width: "100%",
          height: "100%",
          containerType: "inline-size",
          containerName: "tableLayout",
          backgroundColor: (theme) => theme.palette.background.paper,
          border: "1px solid rgba(0, 0, 0, 0.12)",
        }}
      >
        <Table
          aria-label="Source tables"
          style={{
            width: "100%",
            height: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
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
                borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
              }}
            >
              <TableCell
                sx={{
                  padding: 0,
                  width: "40px",
                  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                }}
              ></TableCell>
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
                    disableRipple
                    fullWidth
                    onClick={() => {
                      if (header.attr === sortAttribute) {
                        setIsAscending(!isAscending);
                      } else {
                        setSortAttribute(header.attr);
                      }
                    }}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
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
            {sortedTables.map(({ id }, index) => {
              const isSelected = selectedTableIds.includes(id);
              const isPrevSelected = selectedTableIds.includes(
                sortedTables[index - 1]?.id,
              );
              const isNextSelected = selectedTableIds.includes(
                sortedTables[index + 1]?.id,
              );

              return (
                <EnhancedTableRowSummary
                  key={id}
                  id={id}
                  rowMax={rowMax}
                  columnMax={columnMax}
                  bytesMax={bytesMax}
                  onTrClick={handleRowClick}
                  isSelected={isSelected}
                  isPrevSelected={isPrevSelected}
                  isNextSelected={isNextSelected}
                />
              );
            })}
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
