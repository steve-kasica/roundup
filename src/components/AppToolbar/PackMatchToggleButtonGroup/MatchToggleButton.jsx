import { ToggleButton, Tooltip } from "@mui/material";

const MatchToggleButton = ({ text, children, ...props }) => (
  <Tooltip title={text} placement="top" arrow>
    <span>
      <ToggleButton
        disableRipple
        size="small"
        sx={{
          px: "5px !important",
          border: "none !important",
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        {...props}
      >
        {children}
      </ToggleButton>
    </span>
  </Tooltip>
);

export default MatchToggleButton;
