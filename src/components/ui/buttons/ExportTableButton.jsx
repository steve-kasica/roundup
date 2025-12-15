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
