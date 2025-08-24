import { useDispatch, useSelector } from "react-redux";
import ExportDialog from "./ExportDialog";
import { selectRootOperation } from "../../slices/operationsSlice";
import { setDialogContent } from "../../slices/uiSlice";
import { useCallback } from "react";

export default function ExportCompositeTable() {
  const dispatch = useDispatch();
  const rootOperationId = useSelector((state) => selectRootOperation(state));

  const closeDialog = useCallback(() => {
    dispatch(setDialogContent(null));
  }, [dispatch]);

  return <ExportDialog id={rootOperationId} onClose={closeDialog} />;
}
