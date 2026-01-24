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
 *   tooltipText="Create new pack operation"
 * />
 */

import { ListItemIcon, ListItemText } from "@mui/material";
import { PackOperationIcon } from "../../../ui/icons";
import AddOperationItem from "./AddOperationItem";

const AddPackOperationButton = ({ ...props }) => {
  const onClick = () => console.log("Add Pack Operation button clicked");
  return (
    <AddOperationItem onClick={onClick} {...props}>
      <ListItemIcon>
        <PackOperationIcon />
      </ListItemIcon>
      <ListItemText>Add in pack operation</ListItemText>
    </AddOperationItem>
  );
};

export default AddPackOperationButton;
