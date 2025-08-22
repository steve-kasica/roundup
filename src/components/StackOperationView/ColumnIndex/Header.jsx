import EditableText from "../../ui/EditableText";
import withColumnData from "../../HOC/withColumnData";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useState } from "react";

function Header({
  // Props from withColumnData HOC
  column,
  renameColumn, // method for triggering renaming of the column

  // Props passed directly from ColumnIndex parent component
  index,
  isHeaderEditable,
  operationColumnNameRef,
  onHeaderEditableStateChange,
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography
        variant="subtitle1"
        sx={{
          flexGrow: 1,
          fontSize: "1rem",
          userSelect: "none",
        }}
      >
        {index + 1}.
      </Typography>
      <Box sx={{ userSelect: "none" }}>
        <EditableText
          inputRef={operationColumnNameRef}
          initialValue={column?.name}
          placeholder={`Column ${index + 1}`}
          onChange={renameColumn}
          isReadOnly={true}
          isEditable={isHeaderEditable}
          onEditingStateChange={onHeaderEditableStateChange}
          fontSize="1rem"
        />
      </Box>
    </Box>
  );
}

Header.propTypes = {
  column: PropTypes.shape({
    name: PropTypes.string,
  }),
  index: PropTypes.number.isRequired,
  operationColumnNameRef: PropTypes.object,
  renameColumn: PropTypes.func.isRequired,
  isHeadingFocused: PropTypes.bool.isRequired,
};

const EnhancedHeader = withColumnData(Header);

export default EnhancedHeader;
