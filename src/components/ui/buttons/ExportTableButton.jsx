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
import TooltipIconButton from "./TooltipIconButton";

const ExportTableButton = ({ tooltipText = "Export Table", ...props }) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <Icon fontSize="small" />
    </TooltipIconButton>
  );
};

export default ExportTableButton;
