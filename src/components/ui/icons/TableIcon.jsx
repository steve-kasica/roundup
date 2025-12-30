/**
 * @fileoverview TableIcon Component
 *
 * An icon representing tables. Uses the Grid3X3 icon from lucide-react with
 * tooltip support to visually represent table data structures.
 *
 * Features:
 * - Grid3X3 icon from lucide-react
 * - Tooltip with customizable title
 * - Delayed tooltip appearance (500ms)
 * - Color customization support
 * - Props forwarding for flexibility
 *
 * @module components/ui/icons/TableIcon
 *
 * @example
 * <TableIcon title="Users Table" color="primary" />
 */

import { SvgIcon, Tooltip } from "@mui/material";
import { Grid3X3 as Icon } from "lucide-react";

const TableIcon = ({ title = "Table", color, ...props }) => {
  return (
    <Tooltip enterDelay={500} title={title} placement="top" arrow>
      <SvgIcon color={color}>
        <Icon {...props} />
      </SvgIcon>
    </Tooltip>
  );
};

export default TableIcon;
