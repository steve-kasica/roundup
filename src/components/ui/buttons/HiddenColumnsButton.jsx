/**
 * @fileoverview HiddenColumnsButton Component
 *
 * A button indicating the number of hidden columns. Displays a count of hidden
 * columns with ellipsis indicators (⋯) to show filtered/hidden content.
 *
 * Features:
 * - Hidden column count display
 * - Unicode ellipsis character (⋯)
 * - Small button size
 * - Non-focusable (tabIndex -1)
 * - Props forwarding to IconButton
 *
 * @module components/ui/buttons/HiddenColumnsButton
 *
 * @example
 * <HiddenColumnsButton
 *   count={5}
 *   onClick={handleShowHidden}
 * />
 */

// See https://www.unicode.org/charts/nameslist/n_2B00.html
import { IconButton } from "@mui/material";
// import { ArrowLeft, ArrowRight } from "@mui/icons-material";

const HiddenColumnsButton = ({ count, ...props }) => {
  return (
    <IconButton
      size="small"
      tabIndex={-1}
      {...props}
      sx={{
        position: "relative",
        "&::before": {
          content: `"${count}"`,
          height: "1em",
          minWidth: "1em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ddd",
          borderRadius: "50%",
          padding: "3px",
          position: "absolute",
          top: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.7rem",
          fontWeight: "bold",
          color: "primary.info",
          lineHeight: 1,
        },
        ...props.sx,
      }}
    >
      ⮕⬅
      {/* <ArrowRight size="small" width="0.8em" />
      |
      <ArrowLeft size="small" width="0.8em" /> */}
    </IconButton>
  );
};

export default HiddenColumnsButton;
