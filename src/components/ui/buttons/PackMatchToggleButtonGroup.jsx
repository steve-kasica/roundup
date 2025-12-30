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

import {
  lighten,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import TooltipIconButton from "./TooltipIconButton";
import VennDiagram from "../icons/VennDiagram";
import {
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
} from "../../../slices/operationsSlice";

// TODO: these need to go into theme
const vennFillColor = "#555";
const vennEmptyColor = "#fff";
const disabledStrokeColor = "#aaa";
const enabledStrokeColor = "#000";

const StyledToggleButton = styled(ToggleButton)(() => ({
  px: 1.5,
  border: "none !important",
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
}));

const MatchToggleButton = ({ text, children, ...props }) => (
  <Tooltip
    title={text}
    placement="top"
    arrow
    // enterDelay={300} // 2 seconds
  >
    <span>
      <ToggleButton
        sx={{
          px: 1.5,
          border: "none !important",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        {...props}
      >
        {children}
      </ToggleButton>
    </span>
  </Tooltip>
);

const PackMatchToggleButtonGroup = ({
  value,
  onChange,
  isLeftUnmatchedDisabled,
  isMatchDisabled,
  isRightUnmatchedDisabled,
}) => {
  return (
    <ToggleButtonGroup
      value={value}
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
          value.includes(MATCH_TYPE_LEFT_UNMATCHED) ? "Unselect" : "Select"
        } unmatched rows from the left-hand table ${
          isLeftUnmatchedDisabled ? "(disabled)" : ""
        }`}
        disabled={isLeftUnmatchedDisabled}
      >
        <VennDiagram
          stroke={
            isLeftUnmatchedDisabled ? disabledStrokeColor : enabledStrokeColor
          }
          leftFill={
            isLeftUnmatchedDisabled
              ? lighten(vennFillColor, 0.9)
              : vennFillColor
          }
          overlapFill={vennEmptyColor}
          rightFill={vennEmptyColor}
        />
      </MatchToggleButton>
      <MatchToggleButton
        value={MATCH_TYPE_MATCHES}
        text={`${
          value.includes(MATCH_TYPE_MATCHES) ? "Unselect" : "Select"
        } matched rows from both tables ${isMatchDisabled ? "(disabled)" : ""}`}
        disabled={isMatchDisabled}
      >
        <VennDiagram
          stroke={isMatchDisabled ? disabledStrokeColor : enabledStrokeColor}
          leftFill={vennEmptyColor}
          overlapFill={
            isMatchDisabled ? lighten(vennFillColor, 0.9) : vennFillColor
          }
          rightFill={vennEmptyColor}
        />
      </MatchToggleButton>
      <MatchToggleButton
        value={MATCH_TYPE_RIGHT_UNMATCHED}
        text={`${
          value.includes(MATCH_TYPE_RIGHT_UNMATCHED) ? "Unselect" : "Select"
        } unmatched rows from the right-hand table ${
          isRightUnmatchedDisabled ? "(disabled)" : ""
        }`}
        disabled={isRightUnmatchedDisabled}
      >
        <VennDiagram
          stroke={
            isRightUnmatchedDisabled ? disabledStrokeColor : enabledStrokeColor
          }
          leftFill={vennEmptyColor}
          overlapFill={vennEmptyColor}
          rightFill={
            isRightUnmatchedDisabled
              ? lighten(vennFillColor, 0.9)
              : vennFillColor
          }
        />
      </MatchToggleButton>

      {/* {Array.from(matchLabels.keys())
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
        ))} */}
    </ToggleButtonGroup>
  );
};

export default PackMatchToggleButtonGroup;
