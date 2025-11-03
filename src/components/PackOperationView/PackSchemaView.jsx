/* eslint-disable no-unused-vars */
import { Box, Typography, CircularProgress } from "@mui/material";
import withPackOperationData from "./withPackOperationData";
import { useCallback, useEffect, useState } from "react";
import { usePackStats } from "../../hooks/usePackStats";
import { EnhancedTableLabel, EnhancedTableRowMatches } from "../TableView";
import { JOIN_TYPES } from "../../slices/operationsSlice";
import { EnhancedTableHeader } from "../TableView/TableHeader";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../OperationView/OperationLabel";
import { EnhancedOperationHeader } from "../OperationView/OperationHeader";
import SchemaToolbar from "../ui/SchemaToolbar";
import { EnhancedPackOperationLabel } from "./PackOperationLabel";

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
    // General operation props
    id,
    activeColumnIds,
    selectedOperationColumnIds,
    selectColumns,
    // Pack-specific props
    joinPredicate,
    setJoinType,
    // Left table props (via withPackOperationData)
    leftTableId,
    leftColumns,
    leftKey,
    leftKeyColumnName,
    // Right table props (via withPackOperationData)
    rightTableId,
    rightKey,
    rightKeyColumnName,
    rightColumns,
    // Props defined in `withAssociatedAlerts`
    alertIds,
    hasAlerts,
  }) => {
    // Add hover state for coordinating between tables
    const [hoveredMatch, setHoveredMatch] = useState(null);

    // Add state for column selection across tables
    const [anchorColumn, setAnchorColumn] = useState(null);

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
      leftKeyColumnName,
      rightKeyColumnName,
      joinPredicate
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
        const combinedColumns = [...leftColumns, ...rightColumns];
        let columnsToSelect = [],
          columnsToUnselect = [];
        if (event.shiftKey && anchorColumn) {
          // Shift click: Range selection
          const currentIndex = combinedColumns.indexOf(columnId);
          const lastIndex = combinedColumns.indexOf(anchorColumn);
          const start = Math.min(currentIndex, lastIndex);
          const end = Math.max(currentIndex, lastIndex);
          columnsToSelect = combinedColumns.slice(start, end + 1);
          columnsToUnselect = combinedColumns.filter(
            (id) => !columnsToSelect.includes(id)
          );
        } else if (event.ctrlKey || event.metaKey) {
          // Control/Meta click: Multi-selection toggle
          setAnchorColumn(columnId);
          if (selectedOperationColumnIds.includes(columnId)) {
            // Remove from selection (unselect)
            columnsToUnselect = [columnId];
            columnsToSelect = [];
          } else {
            // Add to selection (select)
            columnsToSelect = [columnId];
            columnsToUnselect = [];
          }
        } else {
          // Single select: Replace selection with current column, or deselect if already selected
          setAnchorColumn(columnId);
          columnsToSelect = [columnId];
          columnsToUnselect = [...leftColumns, ...rightColumns].filter(
            (id) => id !== columnId
          );
        }

        selectColumns(columnsToSelect, columnsToUnselect);

        // Always update last selected column for future range operations
        setAnchorColumn(columnId);
      },
      [
        selectedOperationColumnIds,
        anchorColumn,
        selectColumns,
        leftColumns,
        rightColumns,
      ]
    );

    const handleTableLabelClick = useCallback(
      (event, tableId) => {
        // const isCtrlClick = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd on Mac

        if (tableId === leftTableId) {
          selectColumns(activeColumnIds.slice(0, leftColumns.length));
        } else if (tableId === rightTableId) {
          selectColumns(activeColumnIds.slice(leftColumns.length));
        }
      },
      [leftTableId, rightTableId, leftColumns, selectColumns, activeColumnIds]
    );

    const getVisibleMatches = () => {
      if (hasAlerts || !data) return {};
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
        <SchemaToolbar objectId={id} columnIds={[]} alertIds={alertIds}>
          <EnhancedPackOperationLabel id={id} />
        </SchemaToolbar>
        <Box
          display={"flex"}
          flex={1}
          gap={0.5}
          sx={{
            backgroundColor: hasAlerts ? "error.lighter" : "transparent",
          }}
        >
          {/* This loading state should be reflected in the table blocks themselves */}
          {loading && !data && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="10%"
            >
              <CircularProgress size={24} />
            </Box>
          )}
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
            {[
              { tableId: leftTableId, key: leftKey },
              { tableId: rightTableId, key: rightKey },
            ].map(({ tableId, keyColumn }, index) => (
              <Box
                key={tableId + index}
                width={"50%"}
                display={"flex"}
                flexDirection="column"
                alignItems={"center"}
              >
                {isTableId(tableId) ? (
                  <EnhancedTableLabel
                    id={tableId}
                    includeIcon={false}
                    onClick={(event) => handleTableLabelClick(event, tableId)}
                  />
                ) : (
                  <EnhancedOperationLabel
                    id={tableId}
                    includeIcon={false}
                    onClick={(event) => handleTableLabelClick(event, tableId)}
                  />
                )}
                {isTableId(tableId) ? (
                  <EnhancedTableHeader
                    id={tableId}
                    keyColumnId={keyColumn}
                    columnWidth={"10px"}
                    onColumnClick={(event, columnId) =>
                      handleColumnClick(event, tableId, columnId)
                    }
                  />
                ) : (
                  <EnhancedOperationHeader
                    id={tableId}
                    keyColumnId={keyColumn}
                    columnWidth={"10px"}
                    onColumnClick={(event, columnId) =>
                      handleColumnClick(event, tableId, columnId)
                    }
                  />
                )}
                {isTableId(tableId) ? (
                  <EnhancedTableRowMatches
                    id={tableId}
                    keyColumnId={keyColumn}
                    tablePosition="left"
                    selectedOperationColumnIds={selectedOperationColumnIds}
                    matches={getVisibleMatches()}
                    operationRowCount={totalRows}
                    hoveredRowLabel={hoveredMatch}
                    toggledMatches={toggledMatches}
                    onBlockEnter={handleBlockEnter}
                    onBlockLeave={handleBlockLeave}
                    onBlockClick={handleBlockClick}
                  />
                ) : null}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
);

export default PackSchemaView;
