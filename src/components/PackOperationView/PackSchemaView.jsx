/* eslint-disable no-unused-vars */
import {
  Box,
  Alert,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import withPackOperationData from "./withPackOperationData";
import { EnhancedColumnName } from "../ColumnViews";
import { useCallback, useEffect, useState } from "react";
import { usePackStats } from "../../hooks/usePackStats";
import { EnhancedTableLabel } from "../TableView";
import StatisticsBar from "./StatisticsBar";

const PackSchemaView = withPackOperationData(
  ({
    operation,
    leftTableId,
    leftHandColumns,
    leftRowCount,
    rightTableId,
    rightHandColumns,
    rightRowCount,
    selectColumns,
    joinPredicate,
    leftKey,
    rightKey,
    isPack,
  }) => {
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

    // Call usePackStats hook and log results
    const { data, loading, error } = usePackStats(
      leftTableId,
      rightTableId,
      leftKey,
      rightKey,
      operation.joinPredicate
    );

    const {
      one_to_one_matches,
      one_to_many_matches,
      many_to_one_matches,
      many_to_many_matches,
      one_to_zero_matches,
      zero_to_one_matches,
    } = data || {};

    const totalRows = Object.values(data || {}).reduce(
      (sum, count) => sum + (count || 0),
      0
    );

    // Console log the pack statistics
    useEffect(() => {
      console.log("Pack Statistics Hook Triggered", {
        data,
        leftRowCount,
        rightRowCount,
        loading,
        error,
      });
      if (data) {
        console.log("Pack Statistics:", {
          data,
          leftRowCount,
          rightRowCount,
        });
      }
      if (error) {
        console.error("Pack Statistics Error:", error);
      }
      console.log("Pack Statistics Loading:", loading);
    }, [data, error, loading, leftRowCount, rightRowCount]);

    return (
      <Box display={"flex"} flexDirection="column" height="100%">
        {/* Total rows display */}
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          mb={0.5}
          py={0.25}
          px={0.5}
          sx={{
            backgroundColor: "grey.50",
            borderRadius: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Total Rows: {totalRows.toLocaleString()}
          </Typography>
        </Box>

        <Box
          display={"flex"}
          justifyContent="space-evenly"
          gap={2}
          width="100%"
        >
          <Box
            display="flex"
            alignItems="center"
            flexDirection={"column"}
            flex={1}
            height="100%"
            gap={0.5}
          >
            <EnhancedTableLabel id={leftTableId} includeIcon={false} />
            <Box
              display={"flex"}
              alignItems="center"
              justifyContent={"space-evenly"}
              width="100%"
              gap={0.5}
            >
              {leftHandColumns.map((columnId, index) => (
                <EnhancedColumnName
                  key={columnId}
                  id={columnId}
                  onClick={(event) =>
                    handleColumnClick(event, "left", columnId)
                  }
                  sx={{
                    ...(columnId === leftKey && {
                      backgroundColor: "primary.light",
                      border: "2px solid",
                      borderColor: "primary.main",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                      },
                    }),
                    ...(selectedColumns[0][index] && {
                      backgroundColor: "secondary.light",
                      border: "2px solid",
                      borderColor: "secondary.main",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "secondary.main",
                        color: "secondary.contrastText",
                      },
                    }),
                  }}
                />
              ))}
            </Box>
          </Box>
          <Box
            flex={1}
            height="100%"
            display="flex"
            alignItems="center"
            flexDirection={"column"}
            gap={0.5}
          >
            <EnhancedTableLabel id={rightTableId} includeIcon={false} />
            <Box
              display={"flex"}
              alignItems="center"
              justifyContent={"space-evenly"}
              width="100%"
              gap={0.5}
            >
              {rightHandColumns.map((columnId, index) => (
                <EnhancedColumnName
                  key={columnId}
                  id={columnId}
                  onClick={(event) =>
                    handleColumnClick(event, "right", columnId)
                  }
                  sx={{
                    ...(columnId === rightKey && {
                      backgroundColor: "primary.light",
                      border: "2px solid",
                      borderColor: "primary.main",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                      },
                    }),
                    ...(selectedColumns[1][index] && {
                      backgroundColor: "secondary.light",
                      border: "2px solid",
                      borderColor: "secondary.main",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "secondary.main",
                        color: "secondary.contrastText",
                      },
                    }),
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
        <Box
          display={"flex"}
          flexDirection="column"
          gap={1}
          mt={0}
          height={"100%"}
        >
          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error.message}</Alert>}
          {!loading && !error && (
            <>
              <StatisticsBar
                height={(one_to_one_matches / totalRows) * 100 + "%"}
                // variant="success"
                label={`1:1 (${one_to_one_matches} rows)`}
              />
              <StatisticsBar
                height={(one_to_many_matches / totalRows) * 100 + "%"}
                // variant="error"
                clickable
                label={`1:n (${one_to_many_matches} rows)`}
              />
              <StatisticsBar
                height={(many_to_one_matches / totalRows) * 100 + "%"}
                // variant="error"
                clickable
                label={`n:1 (${many_to_one_matches} rows)`}
              />
              <StatisticsBar
                height={(many_to_many_matches / totalRows) * 100 + "%"}
                // variant="error"
                label={`n:n (${many_to_many_matches} rows)`}
              />
              <StatisticsBar
                height={(one_to_zero_matches / totalRows) * 100 + "%"}
                // variant="warning"
                clickable
                label={`1:0 (${one_to_zero_matches} rows)`}
              />
              <StatisticsBar
                height={(zero_to_one_matches / totalRows) * 100 + "%"}
                // variant="warning"
                clickable
                label={`0:1 (${zero_to_one_matches} rows)`}
              />
            </>
          )}
        </Box>
      </Box>
    );
  }
);

export default PackSchemaView;
