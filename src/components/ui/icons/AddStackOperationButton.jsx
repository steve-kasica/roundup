import IconButton from "@mui/material/IconButton";
import StackOperationIcon from "../../StackOperationView/StackOperationIcon";
import Tooltip from "@mui/material/Tooltip";

const AddStackOperationButton = ({
  onClick,
  tooltip = "Add Stack Operation",
  disabled,
  ...props
}) => (
  <Tooltip title={tooltip} disableHoverListener={disabled}>
    <span>
      <IconButton
        color="primary"
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        <StackOperationIcon />
      </IconButton>
    </span>
  </Tooltip>
);

export default AddStackOperationButton;
