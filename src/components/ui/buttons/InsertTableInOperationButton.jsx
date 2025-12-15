import AddIcon from "@mui/icons-material/Add";
import TooltipIconButton from "./TooltipIconButton";

const InsertTableInOperationButton = ({
  tooltipText = "Insert table in current operation",
  ...props
}) => (
  <TooltipIconButton tooltipText={tooltipText} {...props}>
    <AddIcon />
  </TooltipIconButton>
);

export default InsertTableInOperationButton;
