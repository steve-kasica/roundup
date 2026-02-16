import { Edit } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { useCallback, useState } from "react";
import { FreeTextDialog } from "../../ui/dialogs";
import { useDispatch } from "react-redux";
import { updateColumnsRequest } from "../../../sagas/updateColumnsSaga/actions";

const RenameColumnItem = ({ id, handleCloseMenu }) => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOnClick = useCallback(() => {
    setDialogOpen(true);
  }, []);
  const menuItemSx = {};
  const iconSx = {};
  const handleRenameCancel = useCallback(() => {
    setDialogOpen(false);
    if (handleCloseMenu) {
      handleCloseMenu();
    }
  }, [handleCloseMenu]);
  const handleRenameConfirm = useCallback(
    (event, newName) => {
      setDialogOpen(false);
      dispatch(updateColumnsRequest([{ id, name: newName }]));
      if (handleCloseMenu) {
        handleCloseMenu();
      }
    },
    [dispatch, id, handleCloseMenu],
  );
  return (
    <>
      <MenuItem onClick={handleOnClick} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Rename Column</ListItemText>
      </MenuItem>
      <FreeTextDialog
        title="Rename Column"
        open={dialogOpen}
        onClose={handleRenameCancel}
        onConfirm={handleRenameConfirm}
        label="Column Name"
      />
    </>
  );
};

export default RenameColumnItem;
