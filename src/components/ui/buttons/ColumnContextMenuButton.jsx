import { MoreHoriz as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const ColumnContextMenuButton = ({
  tooltipText = "Single column actions",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <Icon />
    </TooltipIconButton>
  );
};

export default ColumnContextMenuButton;
