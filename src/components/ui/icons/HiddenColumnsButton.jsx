import { IconButton, SvgIcon } from "@mui/material";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";

const HiddenColumnsButton = (props) => {
  return (
    <IconButton size="small" tabIndex={-1} {...props}>
      <ArrowRight size="small" width="0.8em" />
      |
      <ArrowLeft size="small" width="0.8em" />
    </IconButton>
  );
};

export default HiddenColumnsButton;
