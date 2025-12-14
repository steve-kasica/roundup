import { SvgIcon } from "@mui/material";
import { TableRowsSplit } from "lucide-react";

const StackOperationIcon = ({ color, ...props }) => {
  return (
    <SvgIcon color={color}>
      <TableRowsSplit {...props} />
    </SvgIcon>
  );
};

export default StackOperationIcon;
