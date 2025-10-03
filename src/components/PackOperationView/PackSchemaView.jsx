/* eslint-disable no-unused-vars */
import {
  Box,
  Alert,
  Button,
  Typography,
  CircularProgress,
  Toolbar,
  Chip,
} from "@mui/material";
import PackOperationIcon from "./PackOperationIcon";
import withPackOperationData from "./withPackOperationData";
import { useCallback, useEffect, useState, useMemo } from "react";
import { usePackStats } from "../../hooks/usePackStats";
import { TableRowMatches } from "../TableView";
import { JOIN_TYPES } from "../../slices/operationsSlice";

const matchLablels = new Map([
  ["one_to_one_matches", "1:1"],
  ["one_to_many_matches", "1:N"],
  ["many_to_one_matches", "N:1"],
  ["many_to_many_matches", "N:N"],
  ["one_to_zero_matches", "1:0"],
  ["zero_to_one_matches", "0:1"],
]);

const PackSchemaView = withPackOperationData(
  ({
    operation,
    tableToOpColumnMap,
    selectedOperationColumnIds,
    leftTableId,
    leftHandColumns,
    leftRowCount,
    rightTableId,
    rightHandColumns,
    rightRowCount,
    selectColumns,
    selectedColumns,
    joinPredicate,
    leftKey,
    rightKey,
    columnCount,
    // functions
    setJoinType,
  }) => {
    // Add hover state for coordinating between tables
    const [hoveredMatch, setHoveredMatch] = useState(null);

    // Add state for column selection across tables
    const [lastSelectedColumn, setLastSelectedColumn] = useState(null);

    // Add toggle state for showing/hiding match types
    const [toggledMatches, setToggledMatches] = useState({
      one_to_one_matches: true,
      one_to_many_matches: true,
      many_to_one_matches: true,
      many_to_many_matches: true,
      one_to_zero_matches: true,
      zero_to_one_matches: true,
    });

    // Call usePackStats hook and log results
    const { data, loading, error } = usePackStats(
      leftTableId,
      rightTableId,
      leftKey,
      rightKey,
      operation.joinPredicate
    );

    // Update toggle state when data changes
    useEffect(() => {
      setToggledMatches((prev) => {
        const newState = { ...prev };
        if (!data) return newState;
        Object.entries(data).forEach(([key, count]) => {
          newState[key] = (count || 0) > 0;
        });
        return newState;
      });
    }, [data]);

    // Calculate join type based on toggled matches
    useEffect(() => {
      const signature = (function (
        one_to_one,
        one_to_n,
        n_to_one,
        n_to_n,
        one_to_zero,
        zero_to_one
      ) {
        let sig = "";
        sig += one_to_zero ? "1" : "0";
        sig += one_to_one || one_to_n || n_to_one || n_to_n ? "1" : "0";
        sig += zero_to_one ? "1" : "0";
        return sig;
      })(
        toggledMatches.one_to_one_matches,
        toggledMatches.one_to_many_matches,
        toggledMatches.many_to_one_matches,
        toggledMatches.many_to_many_matches,
        toggledMatches.one_to_zero_matches,
        toggledMatches.zero_to_one_matches
      );

      const joinType = (function (sig) {
        switch (sig) {
          case "111":
            return JOIN_TYPES.FULL_OUTER;
          case "110":
            return JOIN_TYPES.LEFT_OUTER;
          case "101":
            return JOIN_TYPES.FULL_ANTI;
          case "100":
            return JOIN_TYPES.LEFT_ANTI;
          case "011":
            return JOIN_TYPES.RIGHT_OUTER;
          case "010":
            return JOIN_TYPES.INNER;
          case "001":
            return JOIN_TYPES.RIGHT_ANTI;
          case "000":
          default:
            return JOIN_TYPES.EMPTY;
        }
      })(signature);

      setJoinType(joinType);
    }, [setJoinType, toggledMatches]);

    // Coordinated hover handlers
    const handleBlockEnter = useCallback((event, key) => {
      setHoveredMatch(key);
    }, []);

    const handleBlockLeave = useCallback(() => {
      setHoveredMatch(null);
    }, []);

    const handleBlockClick = useCallback((event, tableId, key) => {
      setToggledMatches((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }, []);

    const handleColumnClick = useCallback(
      (event, tableId, columnId) => {
        const isShiftClick = event.shiftKey;
        const isCtrlClick = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd on Mac

        if (isShiftClick && lastSelectedColumn) {
          // Shift click: Range selection
          const currentIndex = operation.columnIds.indexOf(columnId);
          const lastIndex = operation.columnIds.indexOf(lastSelectedColumn);

          if (currentIndex !== -1 && lastIndex !== -1) {
            const start = Math.min(currentIndex, lastIndex);
            const end = Math.max(currentIndex, lastIndex);
            const rangeColumns = operation.columnIds.slice(start, end + 1);

            // Merge range with existing selection, removing duplicates
            const newSelection = [
              ...new Set([...selectedOperationColumnIds, ...rangeColumns]),
            ];
            selectColumns(newSelection);
          }
        } else if (isCtrlClick) {
          // Control click: Multi-selection toggle
          if (selectedOperationColumnIds.includes(columnId)) {
            // Remove from selection
            const newSelection = selectedOperationColumnIds.filter(
              (id) => id !== columnId
            );
            selectColumns(newSelection);
          } else {
            // Add to selection
            const newSelection = [...selectedOperationColumnIds, columnId];
            selectColumns(newSelection);
          }
        } else {
          // Single select: Replace selection with current column, or deselect if already selected
          if (
            selectedOperationColumnIds.length === 1 &&
            selectedOperationColumnIds.includes(columnId)
          ) {
            // Deselect if this is the only selected column
            selectColumns([]);
          } else {
            // Replace selection with current column
            selectColumns([columnId]);
          }
        }

        // Always update last selected column for future range operations
        setLastSelectedColumn(columnId);
      },
      [
        operation.columnIds,
        selectedOperationColumnIds,
        lastSelectedColumn,
        selectColumns,
      ]
    );

    const handleTableLabelClick = useCallback(
      (event, tableId) => {
        // const isCtrlClick = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd on Mac

        if (tableId === leftTableId) {
          selectColumns(operation.columnIds.slice(0, leftHandColumns.length));
        } else if (tableId === rightTableId) {
          selectColumns(operation.columnIds.slice(leftHandColumns.length));
        }
      },
      [
        leftTableId,
        rightTableId,
        leftHandColumns,
        selectColumns,
        operation.columnIds,
      ]
    );

    const getVisibleMatches = () => {
      return Object.fromEntries(
        Object.entries(data).filter(([label, count]) => count > 0)
      );
    };

    const totalRows = Object.values(data || {}).reduce(
      (sum, count) => sum + (count || 0),
      0
    );

    return (
      <Box display={"flex"} flexDirection="column" height="100%">
        {/* Operation info toolbar */}
        <Toolbar
          variant="dense"
          sx={{
            minHeight: "auto",
            backgroundColor: "grey.50",
            borderRadius: 0.5,
            mb: 0.5,
            px: 1,
            py: 0.5,
          }}
        >
          <Typography
            variant="subtitle2"
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <PackOperationIcon fontSize="small" sx={{ color: "grey.600" }} />
            {operation.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="textSecondary">
              {operation.joinType}
            </Typography>
            <Chip
              label={`${totalRows.toLocaleString()} rows`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: "grey.400",
                color: "grey.700",
                "&:hover": {
                  borderColor: "grey.500",
                },
              }}
            />
            <Chip
              label={`${columnCount} columns`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: "grey.500",
                color: "grey.800",
                "&:hover": {
                  borderColor: "grey.600",
                },
              }}
            />
          </Box>
        </Toolbar>

        <Box display={"flex"} flex={1} gap={0.5}>
          {loading && !data && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="100%"
            >
              <CircularProgress size={24} />
            </Box>
          )}
          {error && !data && (
            <Alert severity="error">
              <Typography variant="body2">
                Failed to load pack statistics:{" "}
                {error.message || "Unknown error"}
              </Typography>
            </Alert>
          )}
          {!loading && !error && data && (
            <>
              <Box marginTop="59px">
                {Object.entries(getVisibleMatches()).map(([key, value]) => (
                  <Box
                    key={key}
                    height={(value / totalRows) * 100 + "%"}
                    display={"flex"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        height: "24px",
                        userSelect: "none",
                        cursor: "pointer",
                        opacity: hoveredMatch === key ? 1 : 0.8,
                        fontWeight: hoveredMatch === key ? "bold" : "normal",
                      }}
                      onMouseEnter={() => setHoveredMatch(key)}
                      onMouseLeave={() => setHoveredMatch(null)}
                      onClick={(event) => handleBlockClick(event, "label", key)}
                    >
                      {matchLablels.get(key)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box
                display={"flex"}
                justifyContent="space-evenly"
                gap={"5px"}
                width="100%"
                height={"100%"}
              >
                <TableRowMatches
                  table={{
                    columnIds: operation.columnIds.slice(
                      0,
                      leftHandColumns.length
                    ),
                    id: leftTableId,
                  }}
                  key={leftKey}
                  tablePosition="left"
                  selectedOperationColumnIds={selectedOperationColumnIds}
                  matches={getVisibleMatches()}
                  operationRowCount={totalRows}
                  hoveredRowLabel={hoveredMatch}
                  toggledMatches={toggledMatches}
                  onBlockEnter={handleBlockEnter}
                  onBlockLeave={handleBlockLeave}
                  onBlockClick={handleBlockClick}
                  onColumnClick={handleColumnClick}
                  onTableLabelClick={handleTableLabelClick}
                />
                <TableRowMatches
                  table={{
                    columnIds: operation.columnIds.slice(
                      leftHandColumns.length,
                      operation.columnIds.length
                    ),
                    id: rightTableId,
                  }}
                  key={rightKey}
                  tablePosition="right"
                  selectedOperationColumnIds={selectedOperationColumnIds}
                  matches={getVisibleMatches()}
                  operationRowCount={totalRows}
                  hoveredRowLabel={hoveredMatch}
                  toggledMatches={toggledMatches}
                  onBlockEnter={handleBlockEnter}
                  onBlockLeave={handleBlockLeave}
                  onBlockClick={handleBlockClick}
                  onColumnClick={handleColumnClick}
                  onTableLabelClick={handleTableLabelClick}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    );
  }
);

export default PackSchemaView;
