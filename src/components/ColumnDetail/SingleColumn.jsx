import React from "react";
import withColumnData from "../ColumnView/withColumnData";
import { Box, Divider, Typography } from "@mui/material";
import ColumnStats from "./ColumnStats";
import ColumnValues from "./ColumnValues";
import ValueCounts from "./ValueCounts";

const SingleColumn = withColumnData(
  ({ column, uniqueCount, duplicateCount, mode, nullCount, completeness }) => {
    return (
      <Box sx={{ p: 1 }}>
        <h2>{column.name}</h2>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Stats
        </Typography>
        <ColumnStats
          data={{
            null: nullCount,
            completeness: `${completeness * 100}%`,
            unique: uniqueCount,
            duplicate: duplicateCount,
            top: `${mode} (${column.values[mode] || 0})`,
          }}
        />
        <Divider sx={{ my: 2 }} />
        <ValueCounts
          columnId={column.id}
          tableId={column.tableId}
          uniqueCount={uniqueCount}
        />
        {/* <ColumnValues columnId={column.id} tableId={column.tableId} /> */}
      </Box>
    );
  }
);

export default SingleColumn;
