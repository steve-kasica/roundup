/**
 * @fileoverview UploadTablesButton Component
 *
 * A button for uploading table files. Provides a hidden file input with upload
 * icon button interface. Supports multiple file selection.
 *
 * Features:
 * - Upload icon button
 * - Hidden file input
 * - Multiple file selection
 * - File upload callback
 * - Customizable tooltip text
 *
 * @module components/ui/buttons/UploadTablesButton
 *
 * @example
 * <UploadTablesButton
 *   onFileUpload={handleFilesUploaded}
 *   tooltipText="Upload CSV files"
 * />
 */

import { Upload, Close } from "@mui/icons-material";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { TooltipIconButton } from "../../ui/buttons";
import { useCallback, useState } from "react";
import FileUpload from "../../FileUpload";

const UploadTablesButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onClick = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const tooltipText = "Upload Tables";

  return (
    <>
      <TooltipIconButton tooltipText={tooltipText} onClick={onClick}>
        <Upload />
      </TooltipIconButton>
      <Dialog open={dialogOpen} onClose={handleClose} fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Upload Tables
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FileUpload onComplete={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadTablesButton;
