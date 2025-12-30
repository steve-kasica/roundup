/**
 * @fileoverview InsertTableInOperationButton Component
 *
 * A button for inserting tables into the current operation. Displays an add icon
 * to add tables to an operation's schema.
 *
 * Features:
 * - Add icon
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/InsertTableInOperationButton
 *
 * @example
 * <InsertTableInOperationButton
 *   onClick={handleInsert}
 *   tooltipText="Add to join"
 * />
 */

import AddIcon from "@mui/icons-material/Add";
import TooltipIconButton from "./TooltipIconButton";

const InsertTableInOperationButton = ({
  tooltipText = "Insert table in current operation",
  ...props
}) => (
  <TooltipIconButton tooltipText={tooltipText} {...props}>
    <AddIcon />
  </TooltipIconButton>
);

export default InsertTableInOperationButton;
