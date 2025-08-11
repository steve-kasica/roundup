import EditableText from "../../../ui/EditableText";
import withColumnData from "../../../HOC/withColumnData";
import { Box } from "@mui/material";

function Header({ column, index, operationColumnNameRef, renameColumn }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <EditableText
        inputRef={operationColumnNameRef}
        initialValue={column?.name}
        placeholder={`Column ${index + 1}`}
        fontSize="1rem"
        onChange={renameColumn}
      />
    </Box>
  );
}

const EnhancedHeader = withColumnData(Header);

export default EnhancedHeader;
