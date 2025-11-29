import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import Tooltip from "@mui/material/Tooltip";

const InsertTableInOperationButton = ({
  onClick,
  tooltip = "Insert table in current operation",
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
        <AddIcon />
      </IconButton>
    </span>
  </Tooltip>
);

export default InsertTableInOperationButton;
