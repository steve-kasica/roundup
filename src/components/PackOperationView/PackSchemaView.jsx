/* eslint-disable no-unused-vars */
import { Box, Alert, Button, Typography } from "@mui/material";
import withPackOperationData from "./withPackOperationData";
import { ColumnCard } from "../ColumnViews";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import TableLabel from "../TableView/TableLabel";
import { useCallback, useEffect, useState } from "react";
import useMatchValues from "../../hooks/useMatchValues";

const PackSchemaView = withPackOperationData(
  ({
    operation,
    leftHandColumns,
    rightHandColumns,
    selectColumns,
    joinType,
    joinPredicate,
    joinKey1: leftJoinKey,
    joinKey2: rightJoinKey,
    isPack,
  }) => {
    const leftTable = operation.children[0];
    const rightTable = operation.children[1];
    // const [selectedColumns, setSelectedColumns] = useState([
    //   leftHandColumns.map(() => false),
    //   rightHandColumns.map(() => false),
    // ]);

    // const {
    //   data,
    //   loading,
    //   error,
    //   refetch,
    //   reset,
    //   // Computed values
    //   hasData,
    //   isEmpty,
    // } = useMatchValues(
    //   leftTable,
    //   rightTable,
    //   leftJoinKey,
    //   rightJoinKey,
    //   joinPredicate,
    //   joinType
    // );

    // console.log("PackSchemaView", {
    //   operation,
    //   data,
    //   loading,
    //   error,
    //   hasData,
    //   isEmpty,
    // });

    // useEffect(() => {
    //   selectColumns([
    //     ...leftHandColumns.filter((_, i) => selectedColumns[0][i]),
    //     ...rightHandColumns.filter((_, i) => selectedColumns[1][i]),
    //   ]);
    // }, [selectedColumns, leftHandColumns, rightHandColumns, selectColumns]);

    // const handleColumnClick = useCallback(
    //   (event, side, columnId) => {
    //     const columnIndex =
    //       side === "left"
    //         ? leftHandColumns.indexOf(columnId)
    //         : rightHandColumns.indexOf(columnId);

    //     setSelectedColumns((prev) => {
    //       const newSelected = [...prev];
    //       newSelected[side === "left" ? 0 : 1][columnIndex] =
    //         !newSelected[side === "left" ? 0 : 1][columnIndex];
    //       return newSelected;
    //     });
    //   },
    //   [leftHandColumns, rightHandColumns]
    // );

    // Handle error state
    if (error) {
      return (
        <Box display="flex" flexDirection="column" gap={2} width="100%">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                Retry
              </Button>
            }
          >
            <Typography variant="body2">
              Error loading match values: {error.message || "Unknown error"}
            </Typography>
          </Alert>
        </Box>
      );
    }

    // Handle loading state
    if (loading) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          width="100%"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            Loading match values...
          </Typography>
        </Box>
      );
    }

    return (
      <Box display={"flex"} flexDirection="column" gap={0} width={"100%"}>
        <Box display="flex" flexDirection="column" gap={0} alignItems="center">
          <TableLabel id={operation.children[0]} />
          <Box display={"flex"} flexDirection="row" gap={0}>
            {leftHandColumns.map((columnId) => (
              <ColumnCard
                key={columnId}
                id={columnId}
                sx={{ width: "150px" }}
                // onClick={(event) => handleColumnClick(event, "left", columnId)}
              >
                <ColumnHeader id={columnId} />
              </ColumnCard>
            ))}
          </Box>
        </Box>

        <Box
          display={"flex"}
          flexDirection="column"
          gap={0}
          alignItems="center"
        >
          <TableLabel id={operation.children[1]} />
          <Box display={"flex"} flexDirection="row" gap={0}>
            {rightHandColumns.map((columnId) => (
              <ColumnCard
                key={columnId}
                id={columnId}
                sx={{ width: "150px" }}
                // onClick={(event) => handleColumnClick(event, "right", columnId)}
              >
                <ColumnHeader id={columnId} />
              </ColumnCard>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
);

export default PackSchemaView;
