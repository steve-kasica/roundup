import { CloudUpload } from "@mui/icons-material";
import { useState } from "react";
import PropTypes from "prop-types";
import {
  styled,
  Typography,
  Paper,
  Box,
  LinearProgress,
  Alert,
} from "@mui/material";

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

const DragDropFileUpload = ({ handleFileUpload, acceptedTypes = "*" }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      "text/csv",
      // TODO: Enable these types when their parsing is supported
      // "application/json",
      // "text/plain",
      // "application/vnd.ms-excel",
      // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // "text/tab-separated-values",
    ];

    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is 100MB.`;
    }

    if (acceptedTypes !== "*" && !allowedTypes.includes(file.type)) {
      return `File ${file.name} has unsupported type. Supported types: CSV.`;
    }

    return null;
  };

  const processFiles = (files) => {
    const fileArray = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      // Simulate upload progress
      validFiles.forEach((file) => {
        const fileId = `${file.name}-${Date.now()}`;
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[fileId] || 0;
            if (current >= 100) {
              clearInterval(interval);
              return prev;
            }
            return { ...prev, [fileId]: current + 10 };
          });
        }, 200);

        // Add to uploaded files after "upload" completes
        setTimeout(() => {
          setUploadedFiles((prev) => [
            ...prev,
            { id: fileId, file, status: "completed" },
          ]);
          setUploadProgress((prev) => {
            // Remove the completed file from progress tracking
            // eslint-disable-next-line no-unused-vars
            const { [fileId]: _, ...rest } = prev;
            return rest;
          });
        }, 2200);
      });

      handleFileUpload?.(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <Box sx={{ mb: 2, height: "100%" }}>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
        id="file-upload-input"
        // TODO: support more types when their parsing is implemented
        accept=".csv"
        // accept=".csv,.json,.txt,.xls,.xlsx,.tsv"
      />

      <FileUploadZone
        isDragActive={isDragActive}
        hasError={errors.length > 0}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload-input").click()}
        elevation={0}
      >
        <CloudUpload
          sx={{
            fontSize: 48,
            color: (theme) =>
              errors.length > 0
                ? theme.palette.error.main
                : isDragActive
                ? theme.palette.primary.main
                : theme.palette.grey[400],
            mb: 2,
          }}
        />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? "Drop files here"
            : "Drag & drop files here, or click to select"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports CSV files (max 100MB each)
        </Typography>
      </FileUploadZone>

      {errors.length > 0 && (
        <Alert severity="error" onClose={clearErrors} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upload Errors:
          </Typography>
          {errors.map((error, index) => (
            <Typography key={index} variant="body2">
              • {error}
            </Typography>
          ))}
        </Alert>
      )}

      {Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploading files...
          </Typography>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <Box key={fileId} sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {fileId.split("-")[0]}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

DragDropFileUpload.propTypes = {
  handleFileUpload: PropTypes.func,
  acceptedTypes: PropTypes.string,
};

export default DragDropFileUpload;
