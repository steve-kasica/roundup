/* eslint-disable react/prop-types */
/**
 * TableLayout.jsx
 * -------------------------------
 */
import { Box, Button } from "@mui/material";
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowUp10,
  ArrowUpDown,
  ArrowUpWideNarrow,
  ArrowUpZA,
} from "lucide-react";
import { useState } from "react";
import { ascending, descending } from "d3";
import { EnhancedTableRowSummary } from "../../TableView";
import PropTypes from "prop-types";
import {
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_DATE,
  COLUMN_TYPE_CATEGORICAL,
} from "../../../slices/columnsSlice";
import { EnhancedTableDragContainer } from "../../TableView/TableDragContainer";
import { DRAG_TYPE_SOURCE_TABLE_ROW } from "../../CustomDragLayer";

// TODO: move this to SourceColumn Type

export const LAYOUT_ID = "table";

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

export default function TableLayout({
  searchString,
  tables,
  rowMax,
  columnMax,
  bytesMax,
  selectedTableIds,
  setSelectedTableIds,
}) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableLayout");
  }
  const [sortAttribute, setSortAttribute] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);

  const tableIds = tables
    .toSorted((a, b) =>
      isAscending
        ? ascending(a[sortAttribute], b[sortAttribute])
        : descending(a[sortAttribute], b[sortAttribute])
    )
    .map((table) => table.id);

  return (
    <Box
      sx={{
        overflowX: "auto",
        width: "100%",
        containerType: "inline-size",
        containerName: "tableLayout",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "2px solid rgba(0, 0, 0, 0.12)",
            }}
          >
            <th></th>
            {headers.map((header) => (
              <th key={header.attr} data-column={header.attr}>
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
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
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
        </tbody>
      </table>
    </Box>
  );
}

TableLayout.propTypes = {
  searchString: PropTypes.string,
  tables: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowMax: PropTypes.number.isRequired,
  columnMax: PropTypes.number.isRequired,
  bytesMax: PropTypes.number.isRequired,
};

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

SortIcon.propTypes = {
  attr: PropTypes.string,
  isSort: PropTypes.bool,
  attrType: PropTypes.string,
  isAscending: PropTypes.bool.isRequired,
};
