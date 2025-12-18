import { Info as Icon } from "@mui/icons-material";
import { Tooltip } from "@mui/material";

const InfoIcon = ({ tooltipText, ...props }) => {
  return (
    <Tooltip title={tooltipText} {...props}>
      <span>
        <Icon
          fontSize="small"
          sx={{
            fontSize: 12,
            color: "text.disabled",
            cursor: "help",
            "&:hover": {
              color: "text.secondary",
            },
          }}
        />
      </span>
    </Tooltip>
  );
};

export default InfoIcon;
