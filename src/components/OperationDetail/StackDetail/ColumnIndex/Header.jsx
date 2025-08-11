import EditableText from "../../../ui/EditableText";
import withColumnData from "../../../HOC/withColumnData";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

function Header({ column, index, operationColumnNameRef, renameColumn }) {
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

Header.propTypes = {
  column: PropTypes.shape({
    name: PropTypes.string,
  }),
  index: PropTypes.number.isRequired,
  operationColumnNameRef: PropTypes.object,
  renameColumn: PropTypes.func.isRequired,
};

const EnhancedHeader = withColumnData(Header);

export default EnhancedHeader;
