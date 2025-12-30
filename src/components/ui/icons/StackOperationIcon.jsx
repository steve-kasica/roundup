/**
 * @fileoverview StackOperationIcon Component
 *
 * An icon representing STACK (union) operations. Uses the TableRowsSplit icon
 * from lucide-react to visually represent stacking tables vertically.
 *
 * Features:
 * - TableRowsSplit icon from lucide-react
 * - Color customization support
 * - Props forwarding for flexibility
 * - SvgIcon wrapper for MUI integration
 *
 * @module components/ui/icons/StackOperationIcon
 *
 * @example
 * <StackOperationIcon color="secondary" />
 */

import { SvgIcon } from "@mui/material";
import { TableRowsSplit } from "lucide-react";

const StackOperationIcon = ({ color, ...props }) => {
  return (
    <SvgIcon color={color}>
      <TableRowsSplit {...props} />
    </SvgIcon>
  );
};

export default StackOperationIcon;
