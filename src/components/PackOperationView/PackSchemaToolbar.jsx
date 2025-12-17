import { EnhancedSchemaToolbar } from "../ui/SchemaToolbar";
import {
  SelectToggleIconButton,
  FocusIconButton,
  HideIconButton,
  DeleteColumnsButton,
  SwapTablesButton,
} from "../ui/buttons";
import { EnhancedPackOperationLabel } from "./PackOperationLabel";
import { useCallback } from "react";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";
import withPackOperationData from "./withPackOperationData";
import {
  Box,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { JOIN_TYPES } from "../../slices/operationsSlice";

const PackSchemaToolbar = ({
  // Props defined in `withGlobalInterfaceData.jsx` HOC
  focusColumns, // Sets focused column IDs globally

  // Props passed via `withOperationData.jsx` HOC
  id,
  deleteColumns, // Deletes columns globally
  swapTablePositions, // Swaps the positions of children

  // Props passed via `withPackOperationData.jsx` HOC
  matchStats,
  matchLabels,
  matchKeys,
  validMatchGroups,
  joinType,
  setJoinType,
  leftColumnIds,
  rightColumnIds,

  // Props passed via `withAssociatedAlerts.jsx` HOC
  alertIds,
  errorCount,
  totalCount,

  // Props passed directly from the parent component
  handleHideColumns,
  clickedBlockCells,
  areAnySelected,
  onSelectAllClick,
}) => {
  const isSelectionEmpty = !areAnySelected;

  // Toggled matches is an object with keys as match types and values as booleans

  // When toggle match changes, update the join type
  const handleToggleMatchChange = useCallback(
    (_event, currentMatches) => {
      const signature = matchKeys
        .sort((a, b) => a.localeCompare(b))
        .map((type) => (currentMatches.includes(type) ? "1" : "0"))
        .join("");

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
    },
    [matchKeys, setJoinType]
  );

  // Check if at least one complete column is selected
  const isCompleteColumnSelected = (function () {
    for (const columnId of [...leftColumnIds, ...rightColumnIds]) {
      const allCellsSelected = matchKeys.every((matchLabel) => {
        const cellKey = `${columnId}:${matchLabel}`;
        return clickedBlockCells.has(cellKey);
      });
      if (allCellsSelected && matchKeys.length > 0) {
        return true;
      }
    }

    return false;
  })();

  const handleFocusColumns = useCallback(() => {
    focusColumns(
      Array.from(
        Array.from(clickedBlockCells).reduce((acc, cellKey) => {
          const [columnId] = cellKey.split(":");
          acc.add(columnId);
          return acc;
        }, new Set())
      )
    );
  }, [clickedBlockCells, focusColumns]);

  const handleDeleteColumns = useCallback(
    (columnId) => {
      const columnsToDelete = new Set();
      if (columnId) {
        columnsToDelete.add(columnId);
      } else {
        clickedBlockCells.forEach((cellKey) => {
          const [columnId] = cellKey.split(":");
          columnsToDelete.add(columnId);
        });
      }
      deleteColumns(Array.from(columnsToDelete));
      onSelectAllClick(); // Clear selection after deletion
    },
    [clickedBlockCells, deleteColumns, onSelectAllClick]
  );

  const handleSwapTables = useCallback(() => {
    swapTablePositions(0, 1);
  }, [swapTablePositions]);

  return (
    <EnhancedSchemaToolbar
      id={id}
      customMenuItems={
        <>
          {/* Match category filter buttons */}
          <Box sx={{ overflow: "hidden", flexShrink: 0 }}>
            <ToggleButtonGroup
              value={validMatchGroups}
              exclusive={false}
              aria-label="Toggle match categories"
              size="small"
              sx={{
                flexWrap: "nowrap",
                "& .MuiToggleButton-root": {
                  fontSize: "0.75rem",
                  textTransform: "none",
                  px: 1.5,
                  whiteSpace: "nowrap",
                  borderRadius: 0,
                },
                "& .MuiToggleButton-root:first-of-type": {
                  borderTopLeftRadius: "10px",
                  borderBottomLeftRadius: "10px",
                },
                "& .MuiToggleButton-root:last-of-type": {
                  borderTopRightRadius: "10px",
                  borderBottomRightRadius: "10px",
                },
              }}
              onChange={handleToggleMatchChange}
            >
              <Tooltip title={`${joinType} join`}>
                {Array.from(matchLabels.keys())
                  .sort((a, b) => a.localeCompare(b)) // Sort alphabetically to put matches in center
                  .map((key) => (
                    <ToggleButton
                      key={key}
                      value={key}
                      aria-label={matchLabels.get(key)}
                      disabled={matchStats[key] === 0 || errorCount > 0}
                    >
                      {matchLabels.get(key).replace("Only", "").trim()}
                    </ToggleButton>
                  ))}
              </Tooltip>
            </ToggleButtonGroup>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          {/* Swap tables */}
          <SwapTablesButton onClick={handleSwapTables} />
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <FocusIconButton
            onClick={handleFocusColumns}
            disabled={!isCompleteColumnSelected}
          />
          <HideIconButton
            onClick={() => handleHideColumns()}
            disabled={!isCompleteColumnSelected}
          />
          <DeleteColumnsButton
            onConfirm={handleDeleteColumns}
            disabled={!isCompleteColumnSelected}
          />
          <SelectToggleIconButton
            onClick={onSelectAllClick}
            isSelected={!isSelectionEmpty}
          />
        </>
      }
    >
      <EnhancedPackOperationLabel id={id} />
    </EnhancedSchemaToolbar>
  );
};

const EnhancedPackSchemaToolbar = withPackOperationData(PackSchemaToolbar);

EnhancedPackSchemaToolbar.displayName = "Enhanced Pack Schema Toolbar";

export { PackSchemaToolbar, EnhancedPackSchemaToolbar };
