/**
 * @fileoverview VennDiagram Component
 *
 * A customizable Venn diagram SVG icon for visualizing set intersections and join
 * operations. Supports customization of fill colors, opacity, labels, and dimensions
 * to represent different join match types.
 *
 * Features:
 * - Two overlapping circles with customizable fills
 * - Individual opacity control for each region
 * - Text label in overlap region
 * - Customizable stroke and dimensions
 * - Perfect for visualizing PACK (join) match types
 *
 * @module components/ui/icons/VennDiagram
 *
 * @example
 * <VennDiagram
 *   label="M"
 *   leftFill="#90caf9"
 *   rightFill="#a5d6a7"
 *   overlapFill="#fff176"
 *   size="24"
 * />
 */

import { JoinFull, JoinLeft, JoinRight } from "@mui/icons-material";
import { JOIN_TYPES } from "../../../slices/operationsSlice";
import { SvgIcon } from "@mui/material";

const JoinRightAnti = (props) => {
  return (
    <SvgIcon {...props}>
      <path
        d="M7.5 12c0-.97.23-4.16 3.03-6.5C9.75 5.19 8.9 5 8 5c-3.86 0-7 3.14-7 7s3.14 7 7 7c.9 0 1.75-.19 2.53-.5-2.8-2.34-3.03-5.53-3.03-6.5"
        fill="transparent"
        strokeWidth="2"
        stroke="currentColor"
      />
      {/* <ellipse
        cx="12"
        cy="12"
        rx="3"
        ry="5.74"
        // fill="transparent"
        strokeWidth="1"
      ></ellipse> */}
      <path
        d="M15.5 12c0-.97-.23-4.16-3.03-6.5C13.25 5.19 14.1 5 15 5c3.86 0 7 3.14 7 7s-3.14 7-7 7c-.9 0-1.75-.19-2.53-.5 2.8-2.34 3.03-5.53 3.03-6.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
    </SvgIcon>
  );
};

const JoinLeftAnti = (props) => {
  return (
    <SvgIcon {...props}>
      <path
        d="M7.5 12c0-.97.23-4.16 3.03-6.5C9.75 5.19 8.9 5 8 5c-3.86 0-7 3.14-7 7s3.14 7 7 7c.9 0 1.75-.19 2.53-.5-2.8-2.34-3.03-5.53-3.03-6.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* <ellipse
        cx="12"
        cy="12"
        rx="3"
        ry="5.74"
        // fill="transparent"
        strokeWidth="1"
      ></ellipse> */}
      <path
        d="M15.5 12c0-.97-.23-4.16-3.03-6.5C13.25 5.19 14.1 5 15 5c3.86 0 7 3.14 7 7s-3.14 7-7 7c-.9 0-1.75-.19-2.53-.5 2.8-2.34 3.03-5.53 3.03-6.5"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
      />
    </SvgIcon>
  );
};

const JoinInner = (props) => {
  return (
    <SvgIcon {...props}>
      <path
        d="M7.5 12c0-.97.23-4.16 3.03-6.5C9.75 5.19 8.9 5 8 5c-3.86 0-7 3.14-7 7s3.14 7 7 7c.9 0 1.75-.19 2.53-.5-2.8-2.34-3.03-5.53-3.03-6.5"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
      />
      <ellipse cx="11.5" cy="12" rx="3" ry="6" fill="currentColor" />
      <path
        d="M15.5 12c0-.97-.23-4.16-3.03-6.5C13.25 5.19 14.1 5 15 5c3.86 0 7 3.14 7 7s-3.14 7-7 7c-.9 0-1.75-.19-2.53-.5 2.8-2.34 3.03-5.53 3.03-6.5"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
      />
    </SvgIcon>
  );
};

/**
 * 
 * FULL_OUTER: string;
    LEFT_OUTER: string;
    FULL_ANTI: string;
    LEFT_ANTI: string;
    RIGHT_OUTER: string;
    INNER: string;
    RIGHT_ANTI: string;
    EMPTY: stri
 * @param {*} param0 
 * @returns 
 */
function VennDiagram({ joinType, ...props }) {
  if (joinType === JOIN_TYPES.FULL_OUTER) {
    return <JoinFull {...props} />;
  } else if (joinType === JOIN_TYPES.LEFT_OUTER) {
    return <JoinLeft {...props} />;
  } else if (joinType === JOIN_TYPES.FULL_ANTI) {
    return <JoinFullAnti {...props} />;
  } else if (joinType === JOIN_TYPES.LEFT_ANTI) {
    return <JoinLeftAnti {...props} />;
  } else if (joinType === JOIN_TYPES.RIGHT_OUTER) {
    return <JoinRight {...props} />;
  } else if (joinType === JOIN_TYPES.INNER) {
    return <JoinInner {...props} />;
  } else if (joinType === JOIN_TYPES.RIGHT_ANTI) {
    return <JoinRightAnti {...props} />;
  }
}

export default VennDiagram;
