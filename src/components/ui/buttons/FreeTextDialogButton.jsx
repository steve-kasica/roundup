/**
 * @fileoverview FreeTextDialogButton Component
 *
 * A button for renaming tables, columns, or operations. Opens a FreeTextDialog
 * to collect the new name and dispatches appropriate rename actions.
 *
 * Features:
 * - Rename icon button
 * - FreeTextDialog integration
 * - Support for multiple object types (table, column, pack, stack)
 * - Redux action dispatching
 * - Validation and state management
 *
 * @module components/ui/buttons/FreeTextDialogButton
 *
 * @example
 * <FreeTextDialogButton
 *   id={objectId}
 *   name="Current Name"
 *   objectType={OBJECT_TYPE_TABLE}
 *   tooltipText="Rename table"
 * />
 */

import { useCallback, useState } from "react";
import { DriveFileRenameOutline as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";
import FreeTextDialog from "../dialogs/FreeTextDialog";

const FreeTextDialogButton = ({
  tooltipText = "Tooltip text",
  inputLabel = "Enter text",
  inputTitle = "Input title",
  onConfirm,
  ...props
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = useCallback(() => setDialogOpen(true), []);

  const handleClose = useCallback(() => setDialogOpen(false), []);

  const handleConfirm = useCallback(
    (_event, nextName) => {
      const trimmed = nextName.trim();
      if (trimmed.length > 0 && typeof onConfirm === "function") {
        onConfirm(trimmed);
      }
      setDialogOpen(false);
    },
    [onConfirm]
  );

  return (
    <>
      <TooltipIconButton
        tooltipText={tooltipText}
        onClick={openDialog}
        {...props}
      >
        <Icon />
      </TooltipIconButton>

      <FreeTextDialog
        title={inputTitle}
        open={dialogOpen}
        label={inputLabel}
        onClose={handleClose}
        onConfirm={handleConfirm}
        inputLabel={inputLabel}
      />
    </>
  );
};

export default FreeTextDialogButton;
