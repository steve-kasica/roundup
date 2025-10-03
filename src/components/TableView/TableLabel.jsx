import PropTypes from "prop-types";
import withTableData from "./withTableData";
import { Stack, Typography } from "@mui/material";
import { TableChart } from "@mui/icons-material";
import { formatNumber } from "../../lib/utilities/formaters";

const TableLabel = ({
  table,
  columnCount,
  onClick = () => {},
  includeDimensions = true,
  includeIcon = true,
  sx = {},
}) => {
  const rowCount = formatNumber(table?.rowCount || 0);
  return (
    <Stack direction={"row"} spacing={1} alignItems="center" onClick={onClick}>
      {includeIcon && <TableChart />}
      <Typography
        variant="h6"
        component="div"
        sx={{ userSelect: "none", ...sx }}
      >
        {table?.name}{" "}
        {includeDimensions && (
          <small>
            ({columnCount} x {rowCount})
          </small>
        )}
      </Typography>
    </Stack>
  );
};

TableLabel.propTypes = {
  table: PropTypes.shape({
    name: PropTypes.string,
    rowCount: PropTypes.number,
  }),
  columnCount: PropTypes.number,
  onClick: PropTypes.func,
  includeDimensions: PropTypes.bool,
  includeIcon: PropTypes.bool,
};

TableLabel.displayName = "TableLabel";

const EnhancedTableLabel = withTableData(TableLabel);

export { EnhancedTableLabel, TableLabel };
