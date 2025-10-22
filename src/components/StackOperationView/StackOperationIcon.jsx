import React from "react";
import PropTypes from "prop-types";

const StackOperationIcon = React.forwardRef(function StackOperationIcon(
  {
    size = 24,
    color = "currentColor",
    title = "Stack operation",
    className = "",
    ...props
  },
  ref
) {
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <title>{title}</title>

      {/* three stacked layers */}
      <rect
        x="1"
        y="3"
        fill="black"
        width="20"
        height="4"
        rx="1"
        stroke={color}
        strokeWidth="1"
      />
      <rect
        x="1"
        y="9"
        fill="black"
        width="20"
        height="4"
        rx="1"
        stroke={color}
        strokeWidth="1"
      />
      <rect
        x="1"
        y="15"
        width="20"
        height="4"
        fill="black"
        rx="1"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
});

StackOperationIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
};

export default StackOperationIcon;
