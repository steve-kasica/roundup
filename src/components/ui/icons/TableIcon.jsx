import { SvgIcon, Tooltip } from "@mui/material";
import { Grid3X3 as Icon } from "lucide-react";

const TableIcon = ({ title = "Table", color, ...props }) => {
  return (
    <Tooltip enterDelay={500} title={title} placement="top" arrow>
      <SvgIcon color={color}>
        <Icon {...props} />
      </SvgIcon>
    </Tooltip>
  );
};

export default TableIcon;
