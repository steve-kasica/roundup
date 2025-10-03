import { SvgIcon } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Custom SVG icon representing pack operation with a "P"
 */
const PackOperationIcon = ({ fontSize = "medium", sx = {}, ...props }) => {
  return (
    <SvgIcon fontSize={fontSize} sx={sx} {...props} viewBox="0 0 24 24">
      {/* Letter P for Pack */}
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="Arial, sans-serif"
      >
        P
      </text>
    </SvgIcon>
  );
};

PackOperationIcon.propTypes = {
  fontSize: PropTypes.oneOf(["inherit", "large", "medium", "small"]),
  sx: PropTypes.object,
};

export default PackOperationIcon;
