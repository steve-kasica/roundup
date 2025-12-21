import { EnhancedSchemaToolbar, OBJECT_TYPE_PACK } from "../ui/SchemaToolbar";
import { SwapTablesButton, PackMatchToggleButtonGroup } from "../ui/buttons";
import { useCallback } from "react";
import withPackOperationData from "./withPackOperationData";
import { Divider } from "@mui/material";
import {
  JOIN_TYPES,
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
} from "../../slices/operationsSlice";

const PackSchemaToolbar = ({
  // Props defined in `withGlobalInterfaceData.jsx` HOC
  focusColumns, // Sets focused column IDs globally

  // Props passed via `withOperationData.jsx` HOC
  id,
  name,
  rowCount,
  columnCount,
  setOperationName,
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
  errorCount,

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
      const allCellsSelected = Object.entries(matchStats)
        .filter(
          ([matchLabel, count]) =>
            count > 0 && validMatchGroups.includes(matchLabel)
        )
        .every(([matchLabel]) => {
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

  const handleRenameConfirm = useCallback(
    (newName) => setOperationName(newName),
    [setOperationName]
  );

  return (
    <EnhancedSchemaToolbar
      id={id}
      title={name}
      rowCount={rowCount}
      columnCount={columnCount}
      objectType={OBJECT_TYPE_PACK}
      onFocusColumns={handleFocusColumns}
      onHideColumns={() => handleHideColumns()}
      onDeleteColumns={handleDeleteColumns}
      onRenameConfirm={handleRenameConfirm}
      onSelectToggleColumns={onSelectAllClick}
      isFocusedDisabled={!isCompleteColumnSelected}
      isHideDisabled={!isCompleteColumnSelected}
      isDeleteDisabled={!isCompleteColumnSelected}
      isSelectToggleSelected={!isSelectionEmpty}
      customMenuItems={
        <>
          {/* Match category filter buttons */}
          <Divider orientation="vertical" flexItem />
          <PackMatchToggleButtonGroup
            value={validMatchGroups}
            onChange={handleToggleMatchChange}
            isLeftUnmatchedDisabled={
              matchStats[MATCH_TYPE_LEFT_UNMATCHED] === 0 || errorCount > 0
            }
            isMatchDisabled={
              matchStats[MATCH_TYPE_MATCHES] === 0 || errorCount > 0
            }
            isRightUnmatchedDisabled={
              matchStats[MATCH_TYPE_RIGHT_UNMATCHED] === 0 || errorCount > 0
            }
          />
          <Divider orientation="vertical" flexItem />
          <SwapTablesButton onClick={handleSwapTables} />
        </>
      }
    />
  );
};

const EnhancedPackSchemaToolbar = withPackOperationData(PackSchemaToolbar);

EnhancedPackSchemaToolbar.displayName = "Enhanced Pack Schema Toolbar";

export { PackSchemaToolbar, EnhancedPackSchemaToolbar };
