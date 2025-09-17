import withTableData from "../HOC/withTableData";
import { useRef, useCallback } from "react";
import { Box } from "@mui/material";
import TableBody from "./TableBody.jsx";
import TableHead from "./TableHead.jsx";

const RawTableRows = withTableData(
  ({ table, activeColumnIds, selectedColumnIds, selectColumns }) => {
    const selectedColumnIndices = activeColumnIds.map((colId) =>
      selectedColumnIds.includes(colId) ? true : false
    );

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
      <Box sx={{ overflow: "hidden", width: "100%", height: "100%" }}>
        <TableHead
          activeColumnIds={activeColumnIds}
          selectedColumnIds={selectedColumnIds}
          handleColumnClick={handleColumnClick}
          allowExternalScrollSync={true}
          onScrollContainerRef={(el) =>
            registerScrollContainer("table-head", el)
          }
          onScroll={(scrollLeft, scrollTop) =>
            handleScrollSync("table-head", scrollLeft, scrollTop)
          }
        />
        <TableBody
          id={table.id}
          selectedColumnIndices={selectedColumnIndices}
          allowExternalScrollSync={true}
          onScrollContainerRef={(el) => {
            registerScrollContainer(table.id, el);
          }}
          onScroll={(scrollLeft, scrollTop) =>
            handleScrollSync(table.id, scrollLeft, scrollTop)
          }
        />
      </Box>
    );
  }
);

export default RawTableRows;
