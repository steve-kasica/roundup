import withPackOperationData from "./withPackOperationData";
import { Box } from "@mui/material";
import { useCallback, useRef } from "react";
import { RawTableRows } from "../TableView";

const PackVirtualTable = ({ tableIds }) => {
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
    <>
      {/* <pre>{JSON.stringify(operation, null, 2)}</pre> */}
      <Box
        display="flex"
        flexDirection="row"
        height="100%"
        gap={2}
        width={"100%"}
      >
        {tableIds.map((childId) => (
          <RawTableRows id={childId} key={childId} />
        ))}
        {/* {operation.children.map((childId) => (
          <TableBody
            key={childId}
            id={childId}
            selectedColumnIndices={[]}
            sx={{ width: "50%" }}
            allowExternalScrollSync={true}
            onScrollContainerRef={(el) => {
              registerScrollContainer(childId, el);
            }}
            onScroll={(scrollLeft, scrollTop) =>
              handleScrollSync(childId, scrollLeft, scrollTop)
            }
          />
        ))} */}
      </Box>
    </>
  );
};

export default PackVirtualTable;
