import withStackOperationData from "./withStackOperationData";
import { Box } from "@mui/material";
import { useRef, useCallback } from "react";
import TableBody from "../TableView/TableBody";
import TableHead from "../TableView/TableHead";
import { RawTableRows } from "../TableView";

const StackVirtualTableRows = ({ tableIds }) => {
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
        // <Box key={tableId} display="flex" flexDirection="row" width={"50%"}>
        <RawTableRows
          key={tableId}
          id={tableId}
          onScrollContainerRef={(el) => registerScrollContainer(tableId, el)}
          onScroll={(scrollLeft, scrollTop) =>
            handleScrollSync(tableId, scrollLeft, scrollTop)
          }
        />
        // </Box>
      ))}
      {/* <TableHead
          activeColumnIds={columnIds}
          selectedColumnIds={[]}
          handleColumnClick={() => {}}
          allowExternalScrollSync={true}
        />
        {operation.children.map((childId) => (
          <TableBody
            key={childId}
            id={childId}
            selectedColumnIndices={selectedColumnIndices}
            allowExternalScrollSync={true}
            onScrollContainerRef={(el) => registerScrollContainer(childId, el)}
            onScroll={(scrollLeft, scrollTop) =>
              handleScrollSync(childId, scrollLeft, scrollTop)
            }
          />
        ))} */}
    </Box>
  );
};

export default StackVirtualTableRows;
