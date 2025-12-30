/**
 * @fileoverview AddPackOperationButton Component
 *
 * A specialized button for creating PACK (join) operations. Wraps TooltipIconButton
 * with a PackOperationIcon to provide consistent UI for adding join operations.
 *
 * Features:
 * - Pack operation icon
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/AddPackOperationButton
 *
 * @example
 * <AddPackOperationButton
 *   onClick={handleAddPack}
 *   tooltipText="Create new join operation"
 * />
 */

import PackOperationIcon from "../icons/PackOperationIcon";
import TooltipIconButton from "./TooltipIconButton";

const AddPackOperationButton = ({
  tooltipText = "Add Pack Operation",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <PackOperationIcon />
    </TooltipIconButton>
  );
};

export default AddPackOperationButton;
