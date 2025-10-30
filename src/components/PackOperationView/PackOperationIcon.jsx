/* eslint-disable react/prop-types */
import { Columns2 } from "lucide-react";
import { styled } from "@mui/material/styles";

/**
 * Styled Lucide icon with access to MUI theme
 */
const StyledColumns2 = styled(Columns2, {
  shouldForwardProp: (prop) => prop !== 'hasAlerts',
})(({ theme, hasAlerts }) => ({
  color: hasAlerts ? theme.palette.warning.main : 'inherit',
}));

/**
 * Custom SVG icon representing pack operation
 */
const PackOperationIcon = (props) => {
  return <StyledColumns2 {...props} />;
};

export default PackOperationIcon;
