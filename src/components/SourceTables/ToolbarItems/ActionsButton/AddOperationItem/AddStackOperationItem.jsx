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
 * <AddStackOperationButton />
 */

import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { StackOperationIcon } from "../../../../ui/icons";

const AddStackOperationButton = ({ ...props }) => {
  const onClick = () => console.log("Add Stack Operation button clicked");
  return (
    <MenuItem onClick={onClick} {...props}>
      <ListItemIcon>
        <StackOperationIcon />
      </ListItemIcon>
      <ListItemText>Add in stack operation</ListItemText>
    </MenuItem>
  );
};

export default AddStackOperationButton;
