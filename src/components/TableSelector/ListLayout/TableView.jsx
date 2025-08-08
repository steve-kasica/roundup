import { DragIndicator } from "@mui/icons-material";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import HighlightText from "../../ui/HighlightText";
import { formatNumber } from "../../../lib/utilities/formaters";
import withTableData from "../../HOC/withTableData";
import PropTypes from "prop-types";

function TableView({ table, activeColumnIds, isDisabled, searchString }) {
  return (
    <ListItem
      // TODO: add context menu
      // secondaryAction={ <TableDetailsIcon /> }
      disablePadding
    >
      <ListItemIcon>
        <DragIndicator />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography color={isDisabled ? "textDisabled" : "normal"}>
            <HighlightText pattern={searchString} text={table.name} />
            <small style={{ paddingLeft: "10px" }}>
              {formatNumber(table.rowCount)} x{" "}
              {formatNumber(activeColumnIds.length)}
            </small>
          </Typography>
        }
      />
    </ListItem>
  );
}

TableView.propTypes = {
  table: PropTypes.shape({
    name: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  }).isRequired,
  activeColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  // Optional props
  isDisabled: PropTypes.bool,
  searchString: PropTypes.string,
};

const EnhancedTableView = withTableData(TableView);
export default EnhancedTableView;
