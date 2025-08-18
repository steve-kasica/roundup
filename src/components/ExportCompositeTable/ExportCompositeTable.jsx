import { useState } from "react";
import { useSelector } from "react-redux";
import ExportDialog from "./ExportDialog";
import { Button } from "@mui/material";
import { selectRootOperation } from "../../slices/operationsSlice";

export default function ExportCompositeTable() {
  const [exportOpen, setExportOpen] = useState(false);
  const rootOperationId = useSelector((state) => selectRootOperation(state));
  const isDisabled = rootOperationId === null || rootOperationId === undefined;

  return (
    <>
      <Button
        variant="outlined"
        disabled={isDisabled}
        sx={{ mb: 2 }}
        onClick={() => setExportOpen(true)}
      >
        Export
      </Button>
      <ExportDialog
        open={exportOpen}
        id={rootOperationId}
        onClose={() => setExportOpen(false)}
        onExport={() => setExportOpen(false)}
      />
    </>
  );
}
