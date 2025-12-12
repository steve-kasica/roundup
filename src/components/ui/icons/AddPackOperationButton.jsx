import IconButton from "@mui/material/IconButton";
import PackOperationIcon from "./PackOperationIcon";
import Tooltip from "@mui/material/Tooltip";

const AddPackOperationButton = ({
  onClick,
  tooltip = "Add Pack operation",
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
        <PackOperationIcon />
      </IconButton>
    </span>
  </Tooltip>
);

export default AddPackOperationButton;
