import { Box } from "@mui/material";
import { useRef, useCallback } from "react";
import { EnhancedTableRows } from "../TableView";

export const StackVirtualizedTable = ({ tableIds, operationId }) => {
  // Map of childId -> `<TableBody>` scroll container
  const scrollContainersRef = useRef(new Map());
  const isSyncingRef = useRef(false);

  const registerScrollContainer = useCallback((childId, scrollElement) => {
    if (scrollElement) {
      scrollContainersRef.current.set(childId, scrollElement);
    } else {
      scrollContainersRef.current.delete(childId);
    }
  }, []);

  // This gets called by container when it detects scroll
  const handleScrollSync = useCallback(
    (sourceChildId, scrollLeft, scrollTop) => {
      if (isSyncingRef.current) return;

      isSyncingRef.current = true;

      // Sync to all other containers
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      gap={1}
      width={"100%"}
    >
      {tableIds.map((tableId) => (
        <EnhancedTableRows
          key={tableId}
          id={tableId}
          showHeader={false}
          onScrollContainerRef={(el) => registerScrollContainer(tableId, el)}
          onScroll={(scrollLeft, scrollTop) =>
            handleScrollSync(tableId, scrollLeft, scrollTop)
          }
        />
      ))}
    </Box>
  );
};
