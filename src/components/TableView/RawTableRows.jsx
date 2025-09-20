import withTableData from "../HOC/withTableData";
import { useRef, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ColumnHeader from "../ColumnViews/ColumnHeader.jsx";
import { usePaginatedTableRows } from "../../hooks/useTableRowData.js";

const RawTableRows = withTableData(
  ({ table, activeColumnIds, selectedColumnIds, selectColumns }) => {
    const selectedColumnIndices = activeColumnIds.map((colId) =>
      selectedColumnIds.includes(colId) ? true : false
    );

    const { data } = usePaginatedTableRows(table.id, selectedColumnIds);

    const scrollContainersRef = useRef(new Map());
    const isSyncingRef = useRef(false);

    const registerScrollContainer = useCallback((childId, scrollElement) => {
      if (scrollElement) {
        scrollContainersRef.current.set(childId, scrollElement);
      } else {
        scrollContainersRef.current.delete(childId);
      }
    }, []);

    const handleScrollSync = useCallback(
      (sourceChildId, scrollLeft, scrollTop) => {
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;

        // Sync to all other containers
        console.log("StackVirtualTableRows handleScrollSync", {
          scrollContainersRef,
        });
        scrollContainersRef.current.forEach((container, childId) => {
          if (childId !== sourceChildId && container) {
            container.scrollLeft = scrollLeft;
            container.scrollTop = scrollTop;
          }
        });

        // Use setTimeout instead of requestAnimationFrame for more reliable timing
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 0);
      },
      []
    );

    const handleColumnClick = useCallback(
      (event, columnId) => {
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;

        if (isShift && selectedColumnIds.length > 0) {
          // Shift click: select range from last selected column to current column
          const currentIndex = activeColumnIds.indexOf(columnId);
          const lastSelectedIndex = activeColumnIds.indexOf(
            selectedColumnIds[selectedColumnIds.length - 1]
          );

          const startIndex = Math.min(currentIndex, lastSelectedIndex);
          const endIndex = Math.max(currentIndex, lastSelectedIndex);

          const rangeSelection = activeColumnIds.slice(
            startIndex,
            endIndex + 1
          );

          // Combine existing selection with range selection
          const newSelection = [
            ...new Set([...selectedColumnIds, ...rangeSelection]),
          ];
          selectColumns(newSelection);
        } else if (isCtrlOrCmd) {
          // Ctrl/Cmd click: toggle column selection
          if (selectedColumnIds.includes(columnId)) {
            selectColumns(selectedColumnIds.filter((id) => id !== columnId));
          } else {
            selectColumns([...selectedColumnIds, columnId]);
          }
        } else {
          // Normal click: select only this column
          selectColumns([columnId]);
        }
      },
      [activeColumnIds, selectedColumnIds, selectColumns]
    );

    return (
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              {selectedColumnIds.map((colId, index) => (
                <TableCell
                  key={colId}
                  align="center"
                  sx={{ p: 1 }}
                  // sx={{
                  //   borderBottom: "1px solid rgba(224, 224, 224, 1)",
                  //   backgroundColor: selectedColumnIndices[index]
                  //     ? "rgba(25, 118, 210, 0.08)"
                  //     : "inherit",
                  //   cursor: "pointer",
                  //   userSelect: "none",
                  //   width: table.columnsById[colId]?.width || "auto",
                  //   minWidth: 50,
                  //   maxWidth: 400,
                  // }}
                >
                  <ColumnHeader key={colId} id={colId} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover>
                <TableCell>{rowIndex + 1}</TableCell>
                {row.map((value, cellIndex) => (
                  <TableCell key={activeColumnIds[cellIndex]}>
                    {value === null ? (
                      <Typography
                        color="text.secondary"
                        sx={{ fontStyle: "italic", opacity: 0.6 }}
                      >
                        NULL
                      </Typography>
                    ) : typeof value === "number" ? (
                      value.toLocaleString()
                    ) : (
                      value
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
);

export default RawTableRows;
