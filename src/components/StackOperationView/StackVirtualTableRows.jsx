import withStackOperationData from "./withStackOperationData";
import { Box } from "@mui/material";
import { useRef, useCallback } from "react";
import TableBody from "../TableView/TableBody";
import TableHead from "../TableView/TableHead";

const StackVirtualTableRows = withStackOperationData(
  ({ operation, columnIds, selectedColumnIndices }) => {
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

    // This gets called by `<TableBody>` when it detects scroll
    const handleScrollSync = useCallback(
      (sourceChildId, scrollLeft, scrollTop) => {
        if (isSyncingRef.current) return;

        isSyncingRef.current = true;

        // Sync to all other `<TableBody>` containers
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
      <Box display="flex" flexDirection="column" height="100%" gap={1}>
        <TableHead activeColumnIds={columnIds} selectedColumnIds={[]} />
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
        ))}
      </Box>
    );
  }
);

export default StackVirtualTableRows;

/**
 *       {<Table stickyHeader size="small">
         <TableHead>
          <TableRow sx={{ backgroundColor: "background.paper" }}>
            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                backgroundColor: "background.paper",
                zIndex: 3,
                width: "30px",
                borderRight: "1px solid",
                borderColor: "divider",
              }}
            >
              #
            </TableCell>
            {columnIds.map((columnId) => (
              <ColumnTableHeader
                key={columnId}
                id={columnId}
                isSelected={false}
                // isSelected={selectedColumnIds.includes(columnId)}
                onClickHandler={(event) => handleColumnClick(event, columnId)}
              >
                {columnId}
                <ColumnHeader id={columnId} />
              </ColumnTableHeader>
            ))}
          </TableRow>
        </TableHead> 
      </Table> 
 */
