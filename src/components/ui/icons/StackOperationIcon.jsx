import React from "react";
import PackOperationIcon from "./PackOperationIcon";

const StackOperationIcon = ({
  size = 24,
  color = "currentColor",
  ...props
}) => (
  <PackOperationIcon
    size={size}
    color={color}
    {...props}
    sx={{ transform: "rotate(90deg)" }}
  />
);

export default StackOperationIcon;
