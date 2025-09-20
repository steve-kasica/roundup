/* eslint-disable no-unused-vars */
import { Box } from "@mui/material";
import withPackOperationData from "./withPackOperationData";
import { ColumnCard } from "../ColumnViews";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import TableLabel from "../TableView/TableLabel";
import { useCallback, useEffect, useState } from "react";

const PackSchemaView = withPackOperationData(
  ({ operation, leftHandColumns, rightHandColumns, selectColumns }) => {
    const [selectedColumns, setSelectedColumns] = useState([
      leftHandColumns.map(() => false),
      rightHandColumns.map(() => false),
    ]);

    useEffect(() => {
      selectColumns([
        ...leftHandColumns.filter((_, i) => selectedColumns[0][i]),
        ...rightHandColumns.filter((_, i) => selectedColumns[1][i]),
      ]);
    }, [selectedColumns, leftHandColumns, rightHandColumns, selectColumns]);

    const handleColumnClick = useCallback(
      (event, side, columnId) => {
        const columnIndex =
          side === "left"
            ? leftHandColumns.indexOf(columnId)
            : rightHandColumns.indexOf(columnId);

        setSelectedColumns((prev) => {
          const newSelected = [...prev];
          newSelected[side === "left" ? 0 : 1][columnIndex] =
            !newSelected[side === "left" ? 0 : 1][columnIndex];
          return newSelected;
        });
      },
      [leftHandColumns, rightHandColumns]
    );

    return (
      <Box display={"flex"} flexDirection="row" gap={4} width={"100%"}>
        <Box display="flex" flexDirection="column" gap={2} alignItems="center">
          <TableLabel id={operation.children[0]} />
          <Box display={"flex"} flexDirection="row" gap={2}>
            {leftHandColumns.map((columnId) => (
              <ColumnCard
                key={columnId}
                id={columnId}
                sx={{ width: "150px" }}
                onClick={(event) => handleColumnClick(event, "left", columnId)}
              >
                <ColumnHeader id={columnId} />
              </ColumnCard>
            ))}
          </Box>
        </Box>

        <Box
          display={"flex"}
          flexDirection="column"
          gap={2}
          alignItems="center"
        >
          <TableLabel id={operation.children[1]} />
          <Box display={"flex"} flexDirection="row" gap={2}>
            {rightHandColumns.map((columnId) => (
              <ColumnCard
                key={columnId}
                id={columnId}
                sx={{ width: "150px" }}
                onClick={(event) => handleColumnClick(event, "right", columnId)}
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
