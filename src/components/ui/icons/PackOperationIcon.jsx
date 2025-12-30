/**
 * @fileoverview PackOperationIcon Component
 *
 * An icon representing PACK (join) operations. Uses the TableColumnsSplit icon
 * from lucide-react to visually represent joining tables horizontally.
 *
 * Features:
 * - TableColumnsSplit icon from lucide-react
 * - Color customization support
 * - Props forwarding for flexibility
 * - SvgIcon wrapper for MUI integration
 *
 * @module components/ui/icons/PackOperationIcon
 *
 * @example
 * <PackOperationIcon color="primary" />
 */

import { SvgIcon } from "@mui/material";
import { TableColumnsSplit } from "lucide-react";

const PackOperationIcon = ({ color, ...props }) => {
  return (
    <SvgIcon color={color}>
      <TableColumnsSplit {...props} />
    </SvgIcon>
  );
};

export default PackOperationIcon;
