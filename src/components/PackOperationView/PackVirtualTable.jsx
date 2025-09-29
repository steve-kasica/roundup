/* eslint-disable react/prop-types */
import { Box } from "@mui/material";
import withPackOperationData from "./withPackOperationData";
import { useTableRowData } from "../../hooks";

const PackVirtualTable = ({
  operation,
  leftTableId,
  leftKey,
  leftSelectedColumns,
  rightTableId,
  rightKey,
  rightSelectedColumns,
}) => {
  const {
    data: leftData,
    // loading: leftLoading,
    // error: leftError,
  } = useTableRowData(
    leftTableId,
    [
      ...leftSelectedColumns.filter((columnId) => columnId !== leftKey),
      leftKey,
    ],
    50,
    0,
    leftKey // sort by key column
  );
  const {
    data: rightData,
    // loading: rightLoading,
    // error: rightError,
  } = useTableRowData(
    rightTableId,
    [
      rightKey,
      ...rightSelectedColumns.filter((columnId) => columnId !== rightKey),
    ],
    50,
    0,
    rightKey // sort by key column
  );
  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        height="100%"
        gap={2}
        width={"100%"}
      >
        <pre>
          {JSON.stringify(
            {
              leftTableRows: leftData || null,
              rightTableRows: rightData || null,
              rightKey: rightKey || null,
              leftKey: leftKey || null,
              leftTable: leftTableId || null,
              rightTable: rightTableId || null,
            },
            null,
            2
          )}
        </pre>
      </Box>
    </>
  );
};

PackVirtualTable.displayName = "PackVirtualTable";

const EnhancedPackVirtualTable = withPackOperationData(PackVirtualTable);

EnhancedPackVirtualTable.displayName = "EnhancedPackVirtualTable";

export { PackVirtualTable, EnhancedPackVirtualTable };
