/**
 * @fileoverview ExportTableButton Component
 *
 * A button for triggering table export operations. Displays a download icon
 * with tooltip to export data to various formats.
 *
 * Features:
 * - Download icon
 * - Customizable tooltip text
 * - Small icon size
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/ExportTableButton
 *
 * @example
 * <ExportTableButton
 *   onClick={handleExport}
 *   tooltipText="Export to CSV"
 * />
 */

import { Download as Icon } from "@mui/icons-material";
import { TooltipIconButton } from "../../ui/buttons";
import { Dialog } from "@mui/material";
import { useMemo, useState } from "react";
import { withAssociatedAlerts } from "../../HOC";
import { useSelector } from "react-redux";
import { selectFocusedObjectId } from "../../../slices/uiSlice";
import { isTableId } from "../../../slices/tablesSlice";
import { EnhancedExportDialog } from "./ExportDialog";

const ExportTableButton = ({ totalCount, warningCount, errorCount }) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const focusedObjectId = useSelector(selectFocusedObjectId);

  const handleCloseExportDialog = () => {
    setIsExportDialogOpen(false);
  };

  const isDisabled = errorCount > 0 || !focusedObjectId;

  const tooltipText = useMemo(() => {
    if (isDisabled) {
      if (!focusedObjectId) {
        return "No table selected for export";
      } else {
        return "Cannot export table with alerts";
      }
    } else {
      return `Export ${
        isTableId(focusedObjectId) ? "table" : "operation"
      } to file`;
    }
  }, [isDisabled, focusedObjectId]);

  return (
    <>
      <TooltipIconButton
        tooltipText={tooltipText}
        onClick={() => setIsExportDialogOpen(true)}
        disabled={isDisabled}
      >
        <Icon fontSize="small" />
      </TooltipIconButton>
      <Dialog
        open={isExportDialogOpen}
        onClose={handleCloseExportDialog}
        maxWidth="sm"
        fullWidth
      >
        <EnhancedExportDialog
          id={focusedObjectId}
          open={isExportDialogOpen}
          onClose={handleCloseExportDialog}
        />
      </Dialog>
    </>
  );
};

const EnhancedExportButton = withAssociatedAlerts(ExportTableButton);

const ExportButton = () => {
  const focusedObjectId = useSelector(selectFocusedObjectId);
  return <EnhancedExportButton id={focusedObjectId} />;
};

export default ExportButton;
