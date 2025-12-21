import { useCallback, useState } from "react";
import { DriveFileRenameOutline as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";
import FreeTextDialog from "../dialogs/FreeTextDialog";
import {
  OBJECT_TYPE_COLUMN,
  OBJECT_TYPE_PACK,
  OBJECT_TYPE_STACK,
  OBJECT_TYPE_TABLE,
} from "../SchemaToolbar";

const RenameObjectButton = ({
  tooltipText = "Rename",
  objectType = "Object",
  inputLabel = "Name",
  onConfirm,
  ...props
}) => {
  const title =
    "Rename " +
    (objectType === OBJECT_TYPE_TABLE
      ? "Table"
      : objectType === OBJECT_TYPE_PACK || objectType === OBJECT_TYPE_STACK
      ? "Operation"
      : objectType === OBJECT_TYPE_COLUMN
      ? "Column"
      : "Object");
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    console.log("Closing rename dialog");
    setDialogOpen(false);
  }, []);

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
        title={title}
        open={dialogOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        inputLabel={inputLabel}
      />
    </>
  );
};

export default RenameObjectButton;
