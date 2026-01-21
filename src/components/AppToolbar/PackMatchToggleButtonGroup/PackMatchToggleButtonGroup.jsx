/**
 * @fileoverview PackMatchToggleButtonGroup Component
 *
 * A toggle button group for controlling PACK (join) match display modes. Allows
 * users to filter displayed rows by join match type (all, matched, unmatched left,
 * unmatched right).
 *
 * Features:
 * - Toggle buttons with Venn diagram visualizations
 * - Match type filtering (all, matched, left-only, right-only)
 * - Styled buttons with color coding
 * - Tooltips explaining each match type
 * - Integration with PACK operation state
 *
 * @module components/ui/buttons/PackMatchToggleButtonGroup
 *
 * @example
 * <PackMatchToggleButtonGroup
 *   value="all"
 *   onChange={handleMatchTypeChange}
 * />
 */

import { ToggleButtonGroup } from "@mui/material";
import { VennDiagram } from "../../ui/icons";
import {
  JOIN_TYPES,
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
  OPERATION_TYPE_PACK,
} from "../../../slices/operationsSlice";
import { withAssociatedAlerts, withPackOperationData } from "../../HOC";
import { useSelector } from "react-redux";
import { selectFocusedObjectId } from "../../../slices/uiSlice";
import MatchToggleButton from "./MatchToggleButton";
import { useCallback } from "react";

// TODO: these need to go into theme
const vennFillColor = "#aaa";
const vennEmptyColor = "rgb(238, 238, 238)";
const vennStroke = "#aaa";

const PackMatchToggleButtonGroup = ({
  // Props passed via `withPackOperationData.jsx` HOC
  validMatchGroups,
  matchStats,
  matchKeys,
  setJoinType,
  // Props passed via `withAssocitedAlerts.jsx` HOC
  errorCount = 0,
}) => {
  const isLeftUnmatchedDisabled =
    matchStats === undefined ||
    matchStats[MATCH_TYPE_LEFT_UNMATCHED] === 0 ||
    errorCount > 0;
  const isMatchDisabled =
    matchStats === undefined ||
    matchStats[MATCH_TYPE_MATCHES] === 0 ||
    errorCount > 0;
  const isRightUnmatchedDisabled =
    matchStats === undefined ||
    matchStats[MATCH_TYPE_RIGHT_UNMATCHED] === 0 ||
    errorCount > 0;

  const onChange = useCallback(
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
    [matchKeys, setJoinType],
  );

  return (
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
      onChange={onChange}
    >
      <MatchToggleButton
        value={MATCH_TYPE_LEFT_UNMATCHED}
        text={`${
          validMatchGroups?.includes(MATCH_TYPE_LEFT_UNMATCHED)
            ? "Unselect"
            : "Select"
        } unmatched rows from the left-hand table ${
          isLeftUnmatchedDisabled ? "(disabled)" : ""
        }`}
        disabled={isLeftUnmatchedDisabled}
      >
        <VennDiagram
          disabled={isLeftUnmatchedDisabled}
          stroke={vennStroke}
          leftFill={vennFillColor}
          overlapFill={vennEmptyColor}
          rightFill={vennEmptyColor}
        />
      </MatchToggleButton>
      <MatchToggleButton
        value={MATCH_TYPE_MATCHES}
        text={`${
          validMatchGroups?.includes(MATCH_TYPE_MATCHES) ? "Unselect" : "Select"
        } matched rows from both tables ${isMatchDisabled ? "(disabled)" : ""}`}
        disabled={isMatchDisabled}
      >
        <VennDiagram
          disabled={isMatchDisabled}
          stroke={vennStroke}
          leftFill={vennEmptyColor}
          overlapFill={vennFillColor}
          rightFill={vennEmptyColor}
        />
      </MatchToggleButton>
      <MatchToggleButton
        value={MATCH_TYPE_RIGHT_UNMATCHED}
        text={`${
          validMatchGroups?.includes(MATCH_TYPE_RIGHT_UNMATCHED)
            ? "Unselect"
            : "Select"
        } unmatched rows from the right-hand table ${
          isRightUnmatchedDisabled ? "(disabled)" : ""
        }`}
        disabled={isRightUnmatchedDisabled}
      >
        <VennDiagram
          disabled={isRightUnmatchedDisabled}
          stroke={vennStroke}
          leftFill={vennEmptyColor}
          overlapFill={vennEmptyColor}
          rightFill={vennFillColor}
        />
      </MatchToggleButton>
    </ToggleButtonGroup>
  );
};

// Create the wrapped component outside of the render function
const PackMatchToggleButtonGroupWithData = withAssociatedAlerts(
  withPackOperationData(PackMatchToggleButtonGroup),
);

const EnhancedPackMatchToggleButtonGroup = () => {
  const focusedObject = useSelector((state) => {
    const focusedObjectId = selectFocusedObjectId(state);
    return focusedObjectId ? state.operations.byId[focusedObjectId] : null;
  });

  if (focusedObject?.operationType === OPERATION_TYPE_PACK) {
    return <PackMatchToggleButtonGroupWithData id={focusedObject.id} />;
  } else {
    return <PackMatchToggleButtonGroup />;
  }
};

export { PackMatchToggleButtonGroup, EnhancedPackMatchToggleButtonGroup };
