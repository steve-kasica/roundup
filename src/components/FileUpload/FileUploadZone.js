/**
 * FileUploadZone.js
 * 
 * A styled component for the file upload zone, providing visual feedback
 * based on drag-and-drop activity and error states.
 * Features:
 * - Dynamic border color based on drag state and errors
 * - Responsive padding and margin
 */
import { styled, Paper } from "@mui/material";
const FileUploadZone = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isDragActive" && prop !== "hasError",
})(({ theme, isDragActive, hasError }) => ({
  border: `2px dashed ${
    hasError
      ? theme.palette.error.main
      : isDragActive
      ? theme.palette.primary.main
      : theme.palette.grey[300]
  }`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  backgroundColor: isDragActive
    ? theme.palette.action.hover
    : hasError
    ? theme.palette.error.light + "10"
    : "transparent",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  marginBottom: theme.spacing(2),
  height: "100%",
}));

export default FileUploadZone;