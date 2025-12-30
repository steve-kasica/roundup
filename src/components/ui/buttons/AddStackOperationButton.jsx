/**
 * @fileoverview AddStackOperationButton Component
 *
 * A specialized button for creating STACK (union) operations. Wraps TooltipIconButton
 * with a StackOperationIcon to provide consistent UI for adding union operations.
 *
 * Features:
 * - Stack operation icon
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/AddStackOperationButton
 *
 * @example
 * <AddStackOperationButton
 *   onClick={handleAddStack}
 *   tooltipText="Create new union operation"
 * />
 */

import StackOperationIcon from "../icons/StackOperationIcon";
import TooltipIconButton from "./TooltipIconButton";

const AddStackOperationButton = ({
  tooltipText = "Add Stack Operation",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <StackOperationIcon />
    </TooltipIconButton>
  );
};

export default AddStackOperationButton;
