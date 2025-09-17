import React, { useCallback, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { Box } from "@mui/material";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import ColumnValues from "../ColumnViews/ColumnValues";
import ColumnValuesSample from "../ColumnViews/ColumnValuesSample";
import {
  getValuesInRange,
  getIndexOfValue,
} from "./selectionUtils/selectionUtils";
import TableLabel from "../TableView/TableLabel";
import { ColumnCard } from "../ColumnViews";

const leftColumnWidth = 50; // Fixed width for the left column (row headers)

const StackSchemaView = withStackOperationData(
  ({ columnIdMatrix, columnIds, childIds, selectColumns }) => {
    const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
    // TODO is this necessary?
    const [selectionExtentCell, setSelectionExtentCell] = useState(null);

    const onCellClick = useCallback(
      (event, columnId) => {
        let anchorIndex, extentIndex;
        if (event.shiftKey && selectionAnchorCell) {
          // Shift+Click: select range from anchor to extent
          extentIndex = getIndexOfValue(columnIdMatrix, columnId);
          anchorIndex = selectionAnchorCell;
          selectColumns(
            getValuesInRange(columnIdMatrix, anchorIndex, extentIndex)
          );
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection
          // TODO: decide if we want to toggle selection
          // It kind of makes sense to just work on contiguous selections
          // in this context, so we might not need this
        } else {
          // Single click: select only this column, also handles initial shift clicks
          anchorIndex = getIndexOfValue(columnIdMatrix, columnId);
          extentIndex = anchorIndex;
          selectColumns(columnId);
        }
        setSelectionExtentCell(extentIndex);
        setSelectionAnchorCell(anchorIndex);
      },
      [columnIdMatrix, selectionAnchorCell, selectColumns]
    );

    const onRowLabelClick = useCallback(
      (event, rowIndex) => {
        let anchorIndex, extentIndex;
        if (event.shiftKey && selectionAnchorCell !== null) {
          // Shift+Click: select range from anchor to extent
          extentIndex = rowIndex;
          anchorIndex = selectionAnchorCell;
          selectColumns(
            getValuesInRange(columnIdMatrix, anchorIndex, extentIndex)
          );
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection
          //   selectColumns(columnId);
        } else {
          // Single click: select only this column, also handles initial shift clicks
          selectColumns(columnIdMatrix[rowIndex]);
        }
        setSelectionExtentCell(extentIndex);
        setSelectionAnchorCell(anchorIndex);
      },
      [columnIdMatrix, selectionAnchorCell, selectColumns]
    );

    const onColumnLabelClick = useCallback(
      (event, colIndex) => {
        let anchorIndex, extentIndex;
        if (event.shiftKey && selectionAnchorCell !== null) {
          // Shift+Click: select range from anchor to extent
          extentIndex = colIndex;
          anchorIndex = selectionAnchorCell;
          selectColumns(getValuesInRange(columnIds, anchorIndex, extentIndex));
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection
          //   selectColumns(columnId);
        } else {
          // Single click: select only this column, also handles initial shift clicks
          selectColumns(columnIdMatrix.map((row) => [row[colIndex]]).flat());
        }
        setSelectionExtentCell(extentIndex);
        setSelectionAnchorCell(anchorIndex);
      },
      [selectionAnchorCell, selectColumns, columnIds, columnIdMatrix]
    );

    return (
      <Box className="stack-schema-view" sx={{ height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            gap: "4px",
          }}
        >
          {/* Header Row - Fixed 50px height */}
          <Box
            sx={{
              display: "flex",
              gap: "4px",
              height: "50px",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: `${leftColumnWidth}px`,
                flexShrink: 0,
              }}
            ></Box>
            {columnIds.map((colId, index) => (
              <Box
                key={colId}
                sx={{
                  fontWeight: "bold",
                  //   border: "1px solid #ccc",
                  display: "flex",
                  width: "168px", // Change from 150px to 175px
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  //   background: "#e0e0e0",
                  cursor: "pointer",
                }}
                onClick={(e) => onColumnLabelClick(e, index)}
              >
                {index + 1}
              </Box>
            ))}
          </Box>

          {/* Data Rows Container - Takes remaining space */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "4px",
            }}
          >
            {columnIdMatrix.map((row, rowIndex) => (
              <Box
                key={rowIndex}
                sx={{
                  display: "flex",
                  gap: "4px",
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    width: `${leftColumnWidth}px`,
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                  onClick={(e) => onRowLabelClick(e, rowIndex)}
                >
                  <TableLabel id={childIds[rowIndex]} />
                </Box>
                {row.map((columnId, colIndex) => (
                  <ColumnCard
                    key={columnId}
                    id={columnId}
                    onClick={(e) => onCellClick(e, columnId)}
                    sx={{
                      width: "150px", // Fixed width instead of flex: 1
                      flexShrink: 0,
                    }}
                  >
                    <ColumnHeader id={columnId} />
                    <ColumnValuesSample id={columnId} />
                  </ColumnCard>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
);

export default StackSchemaView;
