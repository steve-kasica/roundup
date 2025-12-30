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

import { Upload } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";
import { useCallback } from "react";

const UploadTablesButton = ({
  onFileUpload,
  tooltipText = "Upload Tables",
}) => {
  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(Array.from(files));
    }
    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  const onClick = useCallback(() => {
    document.getElementById("file-upload-input")?.click();
  }, []);

  return (
    <>
      <TooltipIconButton tooltipText={tooltipText} onClick={onClick}>
        <Upload />
      </TooltipIconButton>
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        style={{ display: "none" }}
        id="file-upload-input"
        accept=".csv"
      />
    </>
  );
};

export default UploadTablesButton;
