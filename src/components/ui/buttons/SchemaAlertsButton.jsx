import { ErrorOutline as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";
import Badge from "@mui/material/Badge";

const SchemaAlertsButton = ({
  badgeContent,
  color = "info",
  tooltipText = "View alerts",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} color={color} {...props}>
      <Badge badgeContent={badgeContent} color={color}>
        <Icon />
      </Badge>
    </TooltipIconButton>
  );
};

export default SchemaAlertsButton;
