# File Upload

A multi-file component module for uploading files via drag-and-drop or file browser.

## Module files

* `FileUpload.jsx`: Main React component handling file uploads, drag-and-drop, validation, parsing, and integration with Redux/DuckDB.
* `FileUploadZone.js`: A styled MUI Paper component providing the drag-and-drop area UI for file uploads.

## File Processing

### Import Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     IMPORT FLOW                             │
│                                                             │
│  1. File dropped/selected                                   │
│                    ↓                                        │
│  2. File validated (format, size)                           │
│                    ↓                                        │
│  3. File parsed (Papa Parse for CSV)                        │
│                    ↓                                        │
│  4. Data loaded into DuckDB                                 │
│                    ↓                                        │
│  5. Schema analyzed (types, stats)                          │
│                    ↓                                        │
│  6. Table added to Redux state                              │
│                    ↓                                        │
│  7. Table appears in list                                   │
└─────────────────────────────────────────────────────────────┘
```

### File Validation

| Check   | Requirement          | Error Message                |
| ------- | -------------------- | ---------------------------- |
| Format  | CSV                  | "Unsupported file format"    |
| Size    | < 100MB              | "File too large (max 100MB)" |
| Content | Valid delimiters     | "Unable to parse file"       |
| Headers | First row as headers | "No headers detected"        |