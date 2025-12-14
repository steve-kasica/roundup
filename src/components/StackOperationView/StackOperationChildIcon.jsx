import React from "react";
import PropTypes from "prop-types";
import { SvgIcon } from "@mui/material";

const StackOperationChildIcon = ({
  size = 24,
  count = 3,
  highlight = null,
  gap = 1,
  strokeWidth = 1,
  color = "currentColor",
  ...props
}) => {
  const rectHeight = size / count - strokeWidth * 2 - gap;
  const rectWidth = size;
  return (
    <SvgIcon fontSize={size} htmlColor={color} {...props}>
      {Array.from({ length: count }, (_, i) => (
        <rect
          key={i}
          x="0"
          y={i * (size / count + gap)}
          width={rectWidth}
          height={rectHeight}
          fill={
            highlight === null
              ? "#000"
              : highlight === i
              ? "#000"
              : "transparent"
          }
          stroke={color}
          strokeWidth={strokeWidth}
        />
      ))}
    </SvgIcon>
  );
};

StackOperationChildIcon.displayName = "Stack Child Icon";

export default StackOperationChildIcon;
