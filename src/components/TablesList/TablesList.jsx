/* eslint-disable react/prop-types */
/**
 * SourceTables.jsx
 *
 * A component for displaying and interacting with the set of source tables.
 */

import { useState } from "react";

import DragDropFileUpload from "./DragDropFileUpload";
import withAllTablesData from "./withAllTablesData";
import { createTablesRequest } from "../../sagas/createTablesSaga";
import { registerFiles } from "../../lib/duckdb";

import "./SourceTables.scss";
import { useDispatch } from "react-redux";
// import Toolbar from "./Toolbar";

import { deleteTablesRequest } from "../../sagas/deleteTablesSaga/actions";
import {
  Box,
  TableHead,
  TableRow,
  Table,
  TableCell,
  Button,
  TableBody,
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
  unselectAllTables,
  createTables,
}) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TablesList");
  }
  // eslint-disable-next-line no-unused-vars
  const [selectedTableType, setSelectedTableType] = useState("");
  const [searchString, setSearchString] = useState("");
  const [sortAttribute, setSortAttribute] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  const filteredTables = tables
    .filter((table) => table.name.toLowerCase().includes(searchString))
    .filter(
      (table) =>
        selectedTableType.length === 0 ||
        table.mimeType.includes(selectedTableType)
    );

  const tableIds = tables
    .toSorted((a, b) =>
      isAscending
        ? ascending(a[sortAttribute], b[sortAttribute])
        : descending(a[sortAttribute], b[sortAttribute])
    )
    .map((table) => table.id);

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

  if (filteredTables.length === 0) {
    return (
      <DragDropFileUpload
        handleFileUpload={handleFileUpload}
        acceptedTypes="*"
      />
    );
  }
  return (
    <Box className="SourceTables">
      {/* <Toolbar
        searchString={searchString}
        selectedTableIds={selectedTableIds}
        layout={layout}
        onSearchChange={(event) =>
          setSearchString(event.target.value.trim().toLowerCase())
        }
        onFileUpload={(event) => {
          const files = event.target.files;
          if (files && files.length > 0 && handleFileUpload) {
            handleFileUpload(Array.from(files));
          }
        }}
        onDeleteAll={() => dispatch(deleteTablesRequest(selectedTableIds))}
        onClearSelection={() => unselectAllTables()}
        // TODO: does this need to be global?
        onSelectAll={() => null}
        onLayoutChange={(event, newValue) => setLayout(newValue)}
      /> */}

      <Box
        sx={{
          overflowX: "auto",
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
          <TableHead>
            <TableRow
              style={{
                borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
              }}
            >
              <TableCell></TableCell>
              {headers.map((header) => (
                <TableCell key={header.attr} data-column={header.attr}>
                  <Button
                    color="inherit"
                    fullWidth
                    sx={{ fontSize: "13px" }}
                    onClick={() => {
                      if (header.attr === sortAttribute) {
                        setIsAscending(!isAscending);
                      } else {
                        setSortAttribute(header.attr);
                      }
                    }}
                  >
                    {/* <Tooltip placement="top" title={header.tooltip}> */}
                    {header.label}
                    {/* </Tooltip> */}
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
            {tableIds.map((id) => (
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
                  rowMax={rowMax}
                  columnMax={columnMax}
                  bytesMax={bytesMax}
                  onTrClick={(event) => {
                    const currentIndex = tableIds.indexOf(id);
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
                      const rangeIds = tableIds.slice(start, end + 1);

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
      </Box>
    </Box>
  );
}

const EnhancedTablesList = withAllTablesData(TablesList);
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
