import { Upload } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";

const UploadTablesButton = ({ onFileUpload, title = "Upload Tables" }) => {
  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFileUpload) {
      onFileUpload(Array.from(files));
    }
    // Reset input value to allow selecting the same file again
    event.target.value = "";
  };

  return (
    <>
      <Tooltip title={title}>
        <span>
          <IconButton
            size="small"
            onClick={() =>
              document.getElementById("file-upload-input")?.click()
            }
          >
            <Upload />
          </IconButton>
        </span>
      </Tooltip>
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
        style={{ display: "none" }}
        id="file-upload-input"
        accept=".csv,.json,.txt,.xls,.xlsx,.tsv"
      />
    </>
  );
};

export default UploadTablesButton;
