/* eslint-disable no-unused-vars */
import {
  Box,
  Alert,
  Button,
  Typography,
  CircularProgress,
  Toolbar,
  Tooltip,
  Chip,
} from "@mui/material";
import PackOperationIcon from "./PackOperationIcon";
import withPackOperationData from "./withPackOperationData";
import { useCallback, useEffect, useState, useMemo } from "react";
import { usePackStats } from "../../hooks/usePackStats";
import { EnhancedTableLabel, EnhancedTableRowMatches } from "../TableView";
import { JOIN_TYPES } from "../../slices/operationsSlice";
import { EnhancedTableHeader } from "../TableView/TableHeader";

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
    activeColumnIds,
    columnCount,
    selectedOperationColumnIds,
    leftTableId,
    leftHandColumns,
    rightTableId,
    selectColumns,
    leftKey,
    leftKeyColumnName,
    rightKey,
    rightKeyColumnName,
    rightHandColumns,
    alerts = [],
    // functions
    setJoinType,
  }) => {
    const hasAlerts = alerts.length > 0;
    const columnToTableMap = useMemo(() => {
      const map = new Map();
      leftHandColumns.forEach((colId) => map.set(colId, leftTableId));
      rightHandColumns.forEach((colId) => map.set(colId, rightTableId));
      return map;
    }, [leftHandColumns, leftTableId, rightHandColumns, rightTableId]);

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
        const combinedColumns = [...leftHandColumns, ...rightHandColumns];
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
          columnsToUnselect = [...leftHandColumns, ...rightHandColumns].filter(
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
        leftHandColumns,
        rightHandColumns,
      ]
    );

    const handleTableLabelClick = useCallback(
      (event, tableId) => {
        // const isCtrlClick = event.ctrlKey || event.metaKey; // Support both Ctrl and Cmd on Mac

        if (tableId === leftTableId) {
          selectColumns(activeColumnIds.slice(0, leftHandColumns.length));
        } else if (tableId === rightTableId) {
          selectColumns(activeColumnIds.slice(leftHandColumns.length));
        }
      },
      [
        leftTableId,
        rightTableId,
        leftHandColumns,
        selectColumns,
        activeColumnIds,
      ]
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
        {/* Operation info toolbar */}
        <Toolbar
          variant="dense"
          sx={{
            minHeight: "auto",
            backgroundColor: hasAlerts ? "error.lighter" : "grey.50",
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
              color: hasAlerts ? "error.main" : "inherit",
              fontWeight: hasAlerts ? 600 : "inherit",
            }}
          >
            <PackOperationIcon
              fontSize="small"
              sx={{ color: hasAlerts ? "error.main" : "grey.600" }}
            />
            {operation.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {hasAlerts && (
              <Alert
                severity="error"
                sx={{
                  width: "100%",
                  paddingY: 0,
                  paddingX: 1,
                  borderRadius: "10px",
                  userSelect: "none",
                }}
                // TODO: why does this not work?
                // slotProps={{
                //   icon: {
                //     sx: {
                //       padding: 0,
                //       margin: 0,
                //       marginRight: 0, // Explicitly remove right margin if needed
                //     },
                //   },
                // }}
              >
                {/** TODO: update to handle multiple */}
                {hasAlerts && (
                  <Tooltip title={alerts[0].message} arrow>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {alerts[0].name}
                    </Typography>
                  </Tooltip>
                )}
              </Alert>
            )}
            {hasAlerts && (
              <Typography variant="body2" color="textSecondary">
                {operation.joinType}
              </Typography>
            )}
            <Chip
              label={`${hasAlerts ? "?" : totalRows.toLocaleString()} rows`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: hasAlerts ? "error.main" : "grey.400",
                color: hasAlerts ? "error.main" : "grey.700",
                backgroundColor: hasAlerts ? "error.lighter" : "transparent",
                "&:hover": {
                  borderColor: hasAlerts ? "error.dark" : "grey.500",
                },
              }}
            />
            <Chip
              label={`${columnCount} columns`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: hasAlerts ? "error.main" : "grey.500",
                color: hasAlerts ? "error.main" : "grey.800",
                backgroundColor: hasAlerts ? "error.lighter" : "transparent",
                "&:hover": {
                  borderColor: hasAlerts ? "error.dark" : "grey.600",
                },
              }}
            />
          </Box>
        </Toolbar>

        <Box
          display={"flex"}
          flex={1}
          gap={0.5}
          sx={{
            border: hasAlerts ? "2px solid" : "none",
            borderColor: hasAlerts ? "error.main" : "transparent",
            borderRadius: hasAlerts ? 1 : 0,
            backgroundColor: hasAlerts ? "error.lighter" : "transparent",
            padding: hasAlerts ? 1 : 0,
          }}
        >
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
          {/* {operation.error !== null && (
            <Alert severity="error" sx={{ width: "100%" }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {operation.error.name}
              </Typography>
              <Typography variant="body2">
                {operation.error.description}
              </Typography>
            </Alert>
          )} */}
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
            <Box
              width={"50%"}
              display={"flex"}
              flexDirection="column"
              alignItems={"center"}
            >
              <EnhancedTableLabel
                id={leftTableId}
                includeIcon={false}
                onClick={(event) => handleTableLabelClick(event, leftTableId)}
              />
              <EnhancedTableHeader
                id={leftTableId}
                keyColumnId={leftKey}
                columnWidth={"10px"}
                onColumnClick={(event, columnId) =>
                  handleColumnClick(event, leftTableId, columnId)
                }
              />
              {operation.error === null ? (
                <EnhancedTableRowMatches
                  id={leftTableId}
                  keyColumnId={leftKey}
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
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                  }}
                ></Box>
              )}
            </Box>
            <Box
              width="50%"
              display={"flex"}
              flexDirection="column"
              alignItems={"center"}
            >
              <EnhancedTableLabel
                id={rightTableId}
                includeIcon={false}
                onClick={(event) => handleTableLabelClick(event, rightTableId)}
              />
              <EnhancedTableHeader
                id={rightTableId}
                keyColumnId={rightKey}
                columnWidth={"10px"}
                onColumnClick={(event, columnId) =>
                  handleColumnClick(event, rightTableId, columnId)
                }
              />
              {operation.error === null ? (
                <EnhancedTableRowMatches
                  id={rightTableId}
                  keyColumnId={rightKey}
                  tablePosition="right"
                  selectedOperationColumnIds={selectedOperationColumnIds}
                  matches={getVisibleMatches()}
                  operationRowCount={totalRows}
                  hoveredRowLabel={hoveredMatch}
                  toggledMatches={toggledMatches}
                  onBlockEnter={handleBlockEnter}
                  onBlockLeave={handleBlockLeave}
                  onBlockClick={handleBlockClick}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                  }}
                ></Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default PackSchemaView;
