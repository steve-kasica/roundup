import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setDialogContent } from "../../slices/uiSlice";
import ExportCompositeTable, {
  MODULE_NAME as EXPORT_MODULE,
} from "../../components/ExportCompositeTable";

export default function ModalDialog() {
  const dispatch = useDispatch();
  const modalModule = useSelector(({ ui }) => ui.dialogContent);
  const isOpen = modalModule !== null;

  return (
    <Dialog
      open={isOpen}
      onClose={() => dispatch(setDialogContent(null))}
      maxWidth="xs"
      fullWidth
    >
      {modalModule === EXPORT_MODULE && <ExportCompositeTable />}
    </Dialog>
  );
}
