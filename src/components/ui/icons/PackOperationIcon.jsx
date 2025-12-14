import { SvgIcon } from "@mui/material";
import { TableColumnsSplit } from "lucide-react";

const PackOperationIcon = ({ color, ...props }) => {
  return (
    <SvgIcon color={color}>
      <TableColumnsSplit {...props} />
    </SvgIcon>
  );
};

export default PackOperationIcon;
