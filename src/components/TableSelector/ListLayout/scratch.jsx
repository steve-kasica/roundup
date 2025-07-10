{
  uploadedFiles.length > 0 && (
    <Paper elevation={1} sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}
      >
        Uploaded Files ({uploadedFiles.length})
      </Typography>
      <List dense>
        {uploadedFiles.map((uploadedFile) => (
          <ListItem key={uploadedFile.id}>
            <ListItemIcon>
              {uploadedFile.status === "completed" ? (
                <CheckCircle color="success" />
              ) : (
                <InsertDriveFile />
              )}
            </ListItemIcon>
            <ListItemText
              primary={uploadedFile.file.name}
              secondary={`${(uploadedFile.file.size / 1024 / 1024).toFixed(
                2
              )} MB • ${uploadedFile.file.type || "Unknown type"}`}
            />
            <IconButton
              edge="end"
              onClick={() => removeFile(uploadedFile.id)}
              size="small"
            >
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
