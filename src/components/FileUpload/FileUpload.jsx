/**
 * @fileoverview FileUpload Component
 *
 * A drag-and-drop file upload zone with progress tracking and validation. Supports
 * uploading CSV files with visual feedback for drag states, upload progress, and errors.
 *
 * Features:
 * - Drag-and-drop interface with visual feedback
 * - File validation (size, type)
 * - Progress bars for individual files
 * - Error display with specific messages
 * - Upload history tracking
 * - Chunked processing callback support
 *
 * @module components/FileUpload/FileUpload
 *
 * @example
 * <FileUpload />
 */

import { CloudUpload } from "@mui/icons-material";
import { useCallback, useState } from "react";
import { Typography, Box, LinearProgress, Alert } from "@mui/material";
import { registerFiles } from "../../lib/duckdb";
import { createTablesRequest } from "../../sagas/createTablesSaga";
import { useDispatch } from "react-redux";
import FileUploadZone from "./FileUploadZone";

const FileUpload = ({ acceptedTypes = "*", onComplete }) => {
  const dispatch = useDispatch();
  const createTables = useCallback(
    (tablesInfo) => {
      dispatch(createTablesRequest(tablesInfo));
    },
    [dispatch],
  );
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);

  async function handleFileUpload(files) {
    if (!files.length) return;

    // Track upload progress for each file
    files.forEach((file) => {
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

      // Remove from progress tracking after completion
      setTimeout(() => {
        setUploadProgress((prev) => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });
      }, 2200);
    });

    registerFiles(files)
      .then(() =>
        createTables(
          files.map((f) => ({
            source: "file upload",
            name: f.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9_]/g, "_"),
            fileName: f.name,
            extension: f.name.split(".").pop().toLowerCase(),
            size: f.size,
            mimeType: f.type,
            dateLastModified: f.lastModified,
          })),
        ),
      )
      .then(() => {
        onComplete && onComplete();
      })
      .catch((error) => {
        alert("Error uploading files: " + error.message);
      });
  }

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

      {Object.keys(uploadProgress).length === 0 &&
      uploadedFiles.length === 0 ? (
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
          <Typography variant="subsection-title" gutterBottom>
            {isDragActive
              ? "Drop files here"
              : "Drag & drop files here, or click to select"}
          </Typography>
          <Typography variant="data-secondary" color="text.secondary">
            Supports CSV files (max 100MB each)
          </Typography>
        </FileUploadZone>
      ) : Object.keys(uploadProgress).length > 0 ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="label" gutterBottom>
            Uploading files...
          </Typography>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <Box key={fileId} sx={{ mb: 1 }}>
              <Typography variant="data-secondary" color="text.secondary">
                {fileId.split("-")[0]}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          ))}
        </Box>
      ) : (
        <Box>
          <Typography variant="data-secondary" color="text.secondary">
            No files being uploaded.
          </Typography>
          <pre>
            {JSON.stringify({ uploadedFiles, uploadProgress }, null, 2)}
          </pre>
        </Box>
      )}

      {errors.length > 0 && (
        <Alert severity="error" onClose={clearErrors} sx={{ mb: 2 }}>
          <Typography variant="label" gutterBottom>
            Upload Errors:
          </Typography>
          {errors.map((error, index) => (
            <Typography key={index} variant="data-secondary">
              • {error}
            </Typography>
          ))}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;
